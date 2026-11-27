#!/usr/bin/env python3
"""Create or update the five 28-day keyly-api subscription plans.

Dry run by default: prints what it would send. Add --apply to write.

  export KEYLY_BASE_URL=https://your-relay.example.com
  export KEYLY_ADMIN_TOKEN=...   # personal access token with billing:read + billing:write
  python3 keyly_plans.py            # dry run
  python3 keyly_plans.py --apply    # create new plans disabled / update existing ones
  python3 keyly_plans.py --apply --enable

Plans are matched by title, so re-running updates them instead of duplicating.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

WEEK_SECONDS = 7 * 24 * 3600

# The owner's price table: (price in CNY charged by the gateway,
# advertised USD per 28 days, weekly USD quota = advertised / 4).
PLANS = [
    (72, 80, 20),
    (158, 180, 45),
    (418, 500, 125),
    (798, 1000, 250),
    (2338, 3000, 750),
]


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
        message = str(payload.get("message"))
        hint = ""
        if "compliance" in message.lower():
            hint = "\n  -> 先在后台网页里确认支付合规声明（只能在浏览器登录后点，令牌做不了）。"
        sys.exit(f"{method} {path} failed: {message}{hint}")
    return payload.get("data")


def list_plans(base_url, token):
    return {item["plan"]["title"]: item["plan"] for item in request(base_url, token, "GET", "/api/subscription/admin/plans") or []}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="actually write to the server")
    parser.add_argument("--enable", action="store_true", help="mark the plans enabled (default: new plans stay disabled)")
    args = parser.parse_args()

    base_url = os.environ.get("KEYLY_BASE_URL", "").rstrip("/")
    token = os.environ.get("KEYLY_ADMIN_TOKEN", "")
    if not base_url or not token:
        sys.exit("Set KEYLY_BASE_URL and KEYLY_ADMIN_TOKEN first.")

    status = request(base_url, None, "GET", "/api/status")
    quota_per_unit = float(status.get("quota_per_unit") or 0)
    if quota_per_unit <= 0:
        sys.exit("Server reported no quota_per_unit; check the setting before continuing.")
    print(f"QuotaPerUnit on server: {quota_per_unit:g} (1 USD = {quota_per_unit:,.0f} units)")

    existing = list_plans(base_url, token)

    expected = {}
    count = len(PLANS)
    for index, (price_cny, label_usd, weekly_usd) in enumerate(PLANS):
        title = f"${label_usd} / 28 天"
        fields = {
            "title": title,
            "subtitle": f"人民币 ¥{price_cny}，每周 ${weekly_usd:g} 额度，从开通起每 7 天重置，未用完不累计",
            "price_amount": price_cny,
            "currency": "USD",  # server forces USD; epay charges price_amount as-is in CNY
            "duration_unit": "day",
            "duration_value": 28,
            "custom_seconds": 0,
            "sort_order": (count - index) * 10,  # list is ordered sort_order desc: cheapest first
            "allow_balance_pay": False,
            "allow_wallet_overflow": False,
            "max_purchase_per_user": 0,
            "total_amount": round(weekly_usd * quota_per_unit),
            "quota_reset_period": "custom",
            "quota_reset_custom_seconds": WEEK_SECONDS,
        }

        current = existing.get(title)
        if current:
            plan = {**current, **fields}  # keep stripe/creem ids, groups, etc.
            if args.enable:
                plan["enabled"] = True
            method, path = "PUT", f"/api/subscription/admin/plans/{current['id']}"
        else:
            plan = {**fields, "enabled": args.enable}
            method, path = "POST", "/api/subscription/admin/plans"

        expected[title] = plan
        print(f"\n{method} {path}  ¥{price_cny}  weekly ${weekly_usd} = {fields['total_amount']:,} units  enabled={plan.get('enabled')}")
        if not args.apply:
            print(json.dumps(plan, ensure_ascii=False, indent=2))
            continue
        request(base_url, token, method, path, {"plan": plan})
        print("  ok")

    if not args.apply:
        print("\nDry run only. Re-run with --apply to write.")
        return

    # Read back what the server stored and compare every field we care about.
    stored = list_plans(base_url, token)
    problems = []
    for title, plan in expected.items():
        saved = stored.get(title)
        if not saved:
            problems.append(f"{title}: not found after write")
            continue
        for key, want in plan.items():
            if key in ("id", "created_at", "updated_at", "currency"):
                continue
            got = saved.get(key)
            if isinstance(want, (int, float)) and isinstance(got, (int, float)):
                same = abs(float(want) - float(got)) < 1e-6
            else:
                same = want == got
            if not same:
                problems.append(f"{title}: {key} = {got!r}, expected {want!r}")
    if problems:
        print("\nRead-back check FAILED:")
        for line in problems:
            print("  " + line)
        sys.exit(1)
    print(f"\nRead-back check passed: {len(expected)} plans match.")


if __name__ == "__main__":
    main()
