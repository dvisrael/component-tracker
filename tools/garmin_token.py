#!/usr/bin/env python3
"""Generate the GARMIN_TOKENS secret (works with two-factor auth, and avoids
GitHub runner-IP rate limits since the Action then resumes a session instead of
doing a fresh password login).

Run locally — it logs into Garmin, prompting for your MFA code, then prints a
token string. Paste that whole string into a repo secret named GARMIN_TOKENS.

    python3 -m venv /tmp/garmin-venv && /tmp/garmin-venv/bin/pip install garminconnect
    /tmp/garmin-venv/bin/python tools/garmin_token.py
"""
import getpass
from garminconnect import Garmin

email = input("Garmin email: ").strip()
password = getpass.getpass("Garmin password: ")

g = Garmin(email, password, prompt_mfa=lambda: input("MFA code: ").strip())
g.login()

print("\n--- copy EVERYTHING between the lines into the GARMIN_TOKENS repo secret ---")
print(g.client.dumps())
print("--- end ---")
