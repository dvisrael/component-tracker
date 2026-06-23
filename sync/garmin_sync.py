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
  LOOKBACK_DAYS  (default 540)     — how far back to pull each run. Older rides
                                     already in rides.json are preserved.
"""
import os, sys, json, time
from datetime import datetime, timedelta, timezone

from garminconnect import Garmin

ROOT       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RIDES_FILE = os.path.join(ROOT, "rides.json")
LOOKBACK   = int(os.environ.get("LOOKBACK_DAYS", "540"))

# Garmin activityType.typeKey values that count as "riding the chain".
def is_cycling(type_key: str) -> bool:
    if not type_key:
        return False
    tk = type_key.lower()
    return ("cycl" in tk) or ("biking" in tk) or tk.endswith("_ride") or tk == "virtual_ride"


def login() -> Garmin:
    # Preferred: resume a saved session (works with two-factor; avoids the
    # runner-IP rate limits that a fresh password login hits). GARMIN_TOKENS is
    # the string printed by tools/garmin_token.py.
    tokens = os.environ.get("GARMIN_TOKENS")
    if tokens and tokens.strip():
        g = Garmin()
        g.login(tokens.strip())  # long token string -> loaded directly
        return g

    email = os.environ.get("GARMIN_EMAIL")
    password = os.environ.get("GARMIN_PASSWORD")
    if not (email and password):
        sys.exit("error: set GARMIN_TOKENS (recommended), or GARMIN_EMAIL + GARMIN_PASSWORD")

    g = Garmin(email, password)
    try:
        needs_mfa, _ = g.login()
    except Exception as e:
        needs_mfa, _err = "error", e
    else:
        _err = None
    if needs_mfa:
        sys.exit(
            "Garmin password login could not complete here"
            + (f" ({type(_err).__name__}: {_err})" if _err else " (two-factor auth required)")
            + ".\nGenerate a session locally with `python tools/garmin_token.py` and add its "
            "output as a GARMIN_TOKENS repo secret — the Action resumes that instead "
            "(also sidesteps runner-IP 429 rate limits)."
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


def get_bike_for_activity(g: Garmin, activity_id: str) -> tuple:
    """Return (uuid, name) of the bike gear used in this activity, or ('', '')."""
    try:
        gear_list = g.get_activity_gear(activity_id) or []
        for item in gear_list:
            if (item.get("gearTypeName") or "").lower() == "bike":
                uuid = item.get("uuid") or ""
                name = item.get("customMakeModel") or item.get("displayName") or ""
                return uuid, name
    except Exception:
        pass
    return "", ""


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
                # gearId absent here — filled in below for rides missing it
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

    # Merge new activity data; preserve gearId already fetched on existing rides.
    for rid, new_ride in fetched.items():
        if rid in merged and merged[rid].get("gearId") is not None:
            new_ride["gearId"] = merged[rid]["gearId"]
            new_ride["gearName"] = merged[rid].get("gearName", "")
        merged[rid] = new_ride

    # Fetch bike gear for rides that haven't been tagged yet.
    # gearId absent (key missing) or None means "not yet looked up".
    needs_gear = [ride for ride in merged.values() if ride.get("gearId") is None]
    if needs_gear:
        print(f"Fetching bike gear for {len(needs_gear)} ride(s)...")
        for i, ride in enumerate(needs_gear):
            gear_id, gear_name = get_bike_for_activity(g, ride["id"])
            ride["gearId"] = gear_id   # '' = no bike found; non-empty = bike UUID
            ride["gearName"] = gear_name
            if i > 0 and i % 10 == 0:
                time.sleep(0.5)        # gentle pacing for bulk backfill

    rides = sorted(merged.values(), key=lambda r: r["date"])
    payload = {
        "updated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "rides": rides,
    }
    with open(RIDES_FILE, "w") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")

    new_count = len(rides) - before
    gear_tagged = sum(1 for r in rides if r.get("gearId"))
    print(f"synced: {len(rides)} rides total ({new_count} new), "
          f"{gear_tagged} with bike gear, lookback {LOOKBACK}d")


if __name__ == "__main__":
    main()
