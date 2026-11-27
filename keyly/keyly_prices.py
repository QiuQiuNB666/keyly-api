#!/usr/bin/env python3
"""Set keyly-api model prices as tiered billing expressions.

Prices are in the plan's own "$" unit (the unit a subscription plan spends),
which is what a model price must be denominated in so the five plans do not
lose money. See 上线清单.md, "模型价：两种填法".

Dry run by default. Add --apply to write; the script re-reads every model and
differs the stored expression against what it sent.

  export KEYLY_BASE_URL=http://127.0.0.1:3300
  export KEYLY_ADMIN_TOKEN=...   # admin access token with the option write scope
  python3 keyly_prices.py
  python3 keyly_prices.py --apply
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

# DeepSeek peak: Monday-Friday 09:00-12:00 and 14:00-18:00 Beijing time.
PEAK = (
    'weekday("Asia/Shanghai") >= 1 && weekday("Asia/Shanghai") <= 5 && '
    '((hour("Asia/Shanghai") >= 9 && hour("Asia/Shanghai") < 12) || '
    '(hour("Asia/Shanghai") >= 14 && hour("Asia/Shanghai") < 18))'
)

# model -> expression. p = input, cr = cache read, c = output, per 1M tokens,
# in plan-$ (cost x 1.3 or 1.5, divided by 0.78; the cheapest plan sells one
# plan-$ for ¥0.779).
PRICES = {
    "deepseek-v4-pro": (
        f'{PEAK} ? tier("peak", p * 15.02 + cr * 0.5006 + c * 45.06) '
        ': tier("off_peak", p * 7.51 + cr * 0.2503 + c * 22.53)'
    ),
    "deepseek-flash": (
        f'{PEAK} ? tier("peak", p * 3.851 + cr * 0.077 + c * 15.4) '
        ': tier("off_peak", p * 1.926 + cr * 0.0385 + c * 7.702)'
    ),
    "qwen-plus": 'tier("standard", p * 1.54 + cr * 0.3081 + c * 3.851)',
    "claude-sonnet-5-5": 'tier("standard", p * 2.64 + cr * 0.26 + c * 13.21)',
    "claude-opus-5-5": 'tier("standard", p * 5.28 + cr * 0.53 + c * 26.42)',
}

MODE_KEY = "billing_setting.billing_mode"
EXPR_KEY = "billing_setting.billing_expr"


def request(base_url, token, method, path, body=None):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(base_url + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode())
    except urllib.error.HTTPError as err:
        sys.exit(f"{method} {path} -> HTTP {err.code}: {err.read().decode()[:500]}")
    if not payload.get("success"):
        sys.exit(f"{method} {path} failed: {payload.get('message')}")
    return payload.get("data")


def snapshot(base_url, token):
    data = request(base_url, token, "GET", "/api/option/model_pricing") or {}
    return {entry["model_name"]: entry for entry in data.get("entries") or []}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    base_url = os.environ.get("KEYLY_BASE_URL", "").rstrip("/")
    token = os.environ.get("KEYLY_ADMIN_TOKEN", "")
    if not base_url or not token:
        sys.exit("Set KEYLY_BASE_URL and KEYLY_ADMIN_TOKEN first.")

    current = snapshot(base_url, token)
    changes, expected = [], {}
    for model, expr in PRICES.items():
        entry = current.get(model)
        if entry is None:
            sys.exit(f"{model}: not in the pricing list. Add the model first (channel or model list).")
        pricing = {MODE_KEY: "tiered_expr", EXPR_KEY: expr}
        changes.append({
            "model_name": model,
            "expected_version": entry["version"],
            "pricing": pricing,
        })
        expected[model] = expr
        print(f"{model}\n  {expr}")

    if not args.apply:
        print("\nDry run only. Re-run with --apply to write.")
        return

    request(base_url, token, "PATCH", "/api/option/model_pricing", {"changes": changes})

    saved = snapshot(base_url, token)
    problems = []
    for model, expr in expected.items():
        got = (saved.get(model) or {}).get("configured") or {}
        if got.get(EXPR_KEY) != expr:
            problems.append(f"{model}: {got.get(EXPR_KEY)!r}")
        if got.get(MODE_KEY) != "tiered_expr":
            problems.append(f"{model}: mode {got.get(MODE_KEY)!r}, expected 'tiered_expr'")
    if problems:
        print("\nRead-back check FAILED:")
        for line in problems:
            print("  " + line)
        sys.exit(1)
    print(f"\nRead-back check passed: {len(expected)} models.")


if __name__ == "__main__":
    main()
