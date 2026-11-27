#!/usr/bin/env python3
"""Create or update the keyly-api Anthropic channel that points at a sub2api pool.

Dry run by default: prints what it would send. Add --apply to write.

  export KEYLY_BASE_URL=http://127.0.0.1:3300
  export KEYLY_ADMIN_TOKEN=...        # admin access token with channel read + sensitive write
  export KEYLY_SUB2API_URL=http://sub2api:8080
  export KEYLY_SUB2API_KEY=sk-...
  python3 keyly_channel.py                       # dry run, pool A
  python3 keyly_channel.py --apply               # create/update pool A
  python3 keyly_channel.py --apply --name claude-pool-b --priority 10
  python3 keyly_channel.py --apply --test        # run the channel test call after writing

Channels are matched by name, so re-running updates them instead of duplicating.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

CHANNEL_TYPE_ANTHROPIC = 14
MODELS = "claude-sonnet-5-5,claude-opus-5-5"


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
        raw = err.read().decode()[:500]
        sys.exit(f"{method} {path} -> HTTP {err.code}: {raw}")
    if not payload.get("success"):
        sys.exit(f"{method} {path} failed: {payload.get('message')}")
    return payload.get("data")


def find_channel(base_url, token, name):
    listing = request(base_url, token, "GET", "/api/channel/") or []
    if isinstance(listing, dict):
        listing = listing.get("items") or listing.get("data") or []
    for item in listing:
        if item.get("name") == name:
            return item
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--name", default="claude-pool-a")
    parser.add_argument("--priority", type=int, default=100, help="higher wins; give the backup pool a lower number")
    parser.add_argument("--test", action="store_true", help="call the channel test endpoint after writing")
    args = parser.parse_args()

    base_url = os.environ.get("KEYLY_BASE_URL", "").rstrip("/")
    token = os.environ.get("KEYLY_ADMIN_TOKEN", "")
    pool_url = os.environ.get("KEYLY_SUB2API_URL", "").rstrip("/")
    pool_key = os.environ.get("KEYLY_SUB2API_KEY", "")
    if not base_url or not token:
        sys.exit("Set KEYLY_BASE_URL and KEYLY_ADMIN_TOKEN first.")
    if not pool_url or not pool_key:
        sys.exit("Set KEYLY_SUB2API_URL and KEYLY_SUB2API_KEY first.")

    fields = {
        "type": CHANNEL_TYPE_ANTHROPIC,
        "name": args.name,
        "base_url": pool_url,
        "key": pool_key,
        "models": MODELS,
        "model_mapping": json.dumps({m: m for m in MODELS.split(",")}, ensure_ascii=False, separators=(",", ":")),
        # "claude-sonnet-5-5" or "claude-opus-5-5"; a wrong test model greys the
        # channel in the dashboard even when the pool works.
        "test_model": "claude-sonnet-5-5",
        "group": "default",
        "priority": args.priority,
        "auto_ban": 1,
        "status": 1,
        "weight": 1,
        "remark": "sub2api pool; see claude号池.md",
    }

    existing = find_channel(base_url, token, args.name)
    if existing:
        channel = {**existing, **fields, "id": existing["id"]}
        method, path, body = "PUT", "/api/channel/", channel
        print(f"update channel id={existing['id']} name={args.name}")
    else:
        channel = dict(fields)
        method, path, body = "POST", "/api/channel/", {"mode": "single", "channel": channel}
        print(f"create channel name={args.name}")

    print(json.dumps(fields, ensure_ascii=False, indent=2).replace(pool_key, "sk-...masked"))
    if not args.apply:
        print("\nDry run only. Re-run with --apply to write.")
        return

    request(base_url, token, method, path, body)
    saved = find_channel(base_url, token, args.name)
    if not saved:
        sys.exit("read-back failed: channel not found after write")

    problems = []
    for key, want in fields.items():
        got = saved.get(key)
        if key == "key":
            continue  # the API returns a masked value
        if key == "model_mapping" and isinstance(got, str):
            try:
                got = json.dumps(json.loads(got), ensure_ascii=False, separators=(",", ":"))
            except json.JSONDecodeError:
                pass
        if got != want:
            problems.append(f"{key} = {got!r}, expected {want!r}")
    if problems:
        print("\nRead-back check FAILED:")
        for line in problems:
            print("  " + line)
        sys.exit(1)
    print(f"\nok: channel id={saved['id']} matches.")

    if args.test:
        query = urllib.parse.urlencode({"id": saved["id"]})
        result = request(base_url, token, "GET", f"/api/channel/test/{saved['id']}?{query}")
        print("test call:", json.dumps(result, ensure_ascii=False)[:400])


if __name__ == "__main__":
    main()
