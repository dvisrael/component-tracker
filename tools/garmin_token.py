#!/usr/bin/env python3
"""Generate a GARMIN_TOKENS secret for accounts with two-factor enabled (or to
avoid GitHub runner-IP rate limits on fresh logins).

Run locally — it logs into Garmin, prompting for your MFA code, saves the OAuth
session, and prints a base64 blob. Paste that into a repo secret named
GARMIN_TOKENS. The scheduled Action then resumes the session instead of doing a
password login (no MFA prompt, far less likely to be rate limited).

    pip install garminconnect          # installs garth too
    python tools/garmin_token.py
"""
import base64, getpass, io, os, tarfile, tempfile
import garth

email = input("Garmin email: ").strip()
password = getpass.getpass("Garmin password: ")

# garth handles the MFA challenge via prompt_mfa; just type the code it texts/app-gens.
garth.login(email, password, prompt_mfa=lambda: input("MFA code: ").strip())

token_dir = tempfile.mkdtemp(prefix="garth_")
garth.save(token_dir)  # writes oauth1_token.json + oauth2_token.json

buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode="w:gz") as t:
    for name in os.listdir(token_dir):
        t.add(os.path.join(token_dir, name), arcname=name)

print("\n--- copy EVERYTHING below into the GARMIN_TOKENS repo secret ---\n")
print(base64.b64encode(buf.getvalue()).decode())
print("\n--- end ---")
