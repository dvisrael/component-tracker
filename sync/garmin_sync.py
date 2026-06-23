#!/usr/bin/env python3
"""Pull recent cycling activities from Garmin Connect and merge them into
rides.json (append-only, de-duplicated by activity id). Run by the scheduled
GitHub Action; the web app reads the committed rides.json.

Auth (set as repo secrets / env vars):
  GARMIN_EMAIL + GARMIN_PASSWORD   — for accounts without two-factor, or
  GARMIN_TOKENS                    — base64 of a gzip-tar of a garth token dir
                                     (use tools/garmin_token.py to generate;
                                     required if your account has MFA enabled).
Optional:
  LOOKBACK_DAYS  (default 120)     — how far back to pull each run. Older rides
                                     already in rides.json are preserved.
"""
import os, sys, json, base64, tarfile, io, tempfile
from datetime import datetime, timedelta, timezone

from garminconnect import Garmin

ROOT       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RIDES_FILE = os.path.join(ROOT, "rides.json")
LOOKBACK   = int(os.environ.get("LOOKBACK_DAYS", "120"))

# Garmin activityType.typeKey values that count as "riding the chain".
def is_cycling(type_key: str) -> bool:
    if not type_key:
        return False
    tk = type_key.lower()
    return ("cycl" in tk) or ("biking" in tk) or tk.endswith("_ride") or tk == "virtual_ride"


def login() -> Garmin:
    tokens = os.environ.get("GARMIN_TOKENS")
    if tokens:
        token_dir = tempfile.mkdtemp(prefix="garth_")
        with tarfile.open(fileobj=io.BytesIO(base64.b64decode(tokens)), mode="r:gz") as t:
            t.extractall(token_dir)
        g = Garmin()
        g.login(token_dir)
        return g
    email = os.environ.get("GARMIN_EMAIL")
    password = os.environ.get("GARMIN_PASSWORD")
    if not (email and password):
        sys.exit("error: set GARMIN_EMAIL + GARMIN_PASSWORD, or GARMIN_TOKENS")
    g = Garmin(email, password)
    try:
        g.login()
    except Exception as e:
        sys.exit(
            f"Garmin login failed ({type(e).__name__}: {e}).\n"
            "If your account uses two-factor auth, or this keeps hitting a 429 rate "
            "limit on the runner IP, password login can't complete here. Generate a "
            "session locally with `python tools/garmin_token.py` and add its output "
            "as a GARMIN_TOKENS repo secret — the Action will resume that instead."
        )
    return g


def parse_start(activity: dict) -> str | None:
    """Return ISO-8601 UTC for the activity start, or None."""
    raw = activity.get("startTimeGMT") or activity.get("startTimeLocal")
    if not raw:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f"):
        try:
            dt = datetime.strptime(raw, fmt).replace(tzinfo=timezone.utc)
            return dt.isoformat().replace("+00:00", "Z")
        except ValueError:
            continue
    return None


def fetch_rides(g: Garmin) -> dict:
    """Return {id: ride} for cycling activities within the lookback window."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=LOOKBACK)
    out, start, batch = {}, 0, 50
    while True:
        activities = g.get_activities(start, batch) or []
        if not activities:
            break
        reached_old = False
        for a in activities:
            iso = parse_start(a)
            if iso and datetime.fromisoformat(iso.replace("Z", "+00:00")) < cutoff:
                reached_old = True
                continue
            tk = (a.get("activityType") or {}).get("typeKey", "")
            if not is_cycling(tk):
                continue
            dist_m = a.get("distance") or 0
            if dist_m <= 0 or not iso:
                continue
            aid = str(a.get("activityId"))
            out[aid] = {
                "id": aid,
                "date": iso,
                "km": round(dist_m / 1000.0, 3),
                "name": a.get("activityName") or "",
                "type": tk,
            }
        if reached_old or len(activities) < batch:
            break
        start += batch
    return out


def main():
    try:
        with open(RIDES_FILE) as f:
            existing = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        existing = {"updated": None, "rides": []}

    merged = {r["id"]: r for r in existing.get("rides", []) if r.get("id")}
    before = len(merged)

    g = login()
    fetched = fetch_rides(g)
    merged.update(fetched)  # new data wins on id collision

    rides = sorted(merged.values(), key=lambda r: r["date"])
    payload = {
        "updated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "rides": rides,
    }
    with open(RIDES_FILE, "w") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")

    print(f"synced: {len(rides)} rides total ({len(rides) - before} new), lookback {LOOKBACK}d")


if __name__ == "__main__":
    main()
