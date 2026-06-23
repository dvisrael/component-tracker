#!/usr/bin/env python3
"""Generate a GARMIN_TOKENS secret for accounts with two-factor enabled.

Run locally (it will prompt for your Garmin login and MFA code), then copy the
printed base64 string into a GitHub repo secret named GARMIN_TOKENS. The
scheduled Action will resume the session from it instead of using a password.

    pip install garminconnect
    python tools/garmin_token.py
"""
import base64, getpass, io, os, tarfile, tempfile
from garminconnect import Garmin

email = input("Garmin email: ").strip()
password = getpass.getpass("Garmin password: ")

g = Garmin(email, password)
g.login()  # prompts for the MFA code on the terminal if needed

token_dir = tempfile.mkdtemp(prefix="garth_")
# garminconnect stores the garth OAuth tokens via its client; dump them to disk.
g.garth.dump(token_dir)

buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode="w:gz") as t:
    for name in os.listdir(token_dir):
        t.add(os.path.join(token_dir, name), arcname=name)

print("\n--- copy everything below into the GARMIN_TOKENS repo secret ---\n")
print(base64.b64encode(buf.getvalue()).decode())
