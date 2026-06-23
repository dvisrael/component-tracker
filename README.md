# Component Tracker

A bike-maintenance tracker for **sealant**, **chain wax**, and **chain wear**, built
as an installable web app (PWA). Ride distance for the Wax and Chain cards is
pulled automatically from **Garmin Connect** by a scheduled GitHub Action — every
ride you record adds to both counters.

- Three style presets (Editorial / Instrument / Warm), light & dark, metric & imperial.
- Works offline once installed; your maintenance actions are stored on the device.
- No server to run: GitHub Pages hosts the app, a free GitHub Action does the sync.

## How distance tracking works

Each component stores a manual baseline plus a **sync anchor** timestamp. The
displayed distance is `baseline + (sum of Garmin rides recorded after the anchor)`.
Logging a wax or a new chain resets the baseline to 0 and the anchor to now;
editing a value by hand sets it as the new baseline from now on. This means a
hand-entered total is never double-counted against rides that already happened.

Sealant is purely time-based (a 90-day cycle) and is independent of rides.

---

## Setup

### 1. Put the code in a GitHub repo

```bash
cd "component tracker"
git init -b main
git add .
git commit -m "Component Tracker PWA"
gh repo create component-tracker --public --source=. --push
```

(or create the repo in the GitHub UI and `git push` to it.)

### 2. Turn on GitHub Pages

Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
branch **`main`**, folder **`/ (root)`**. After a minute the app is live at
`https://<you>.github.io/component-tracker/`.

### 3. Add your Garmin credentials as repo secrets

Repo **Settings → Secrets and variables → Actions → New repository secret**.

- **No two-factor on your Garmin account:** add `GARMIN_EMAIL` and `GARMIN_PASSWORD`.
- **Two-factor enabled:** run the token helper locally and add the one secret it prints:

  ```bash
  pip install garminconnect
  python tools/garmin_token.py        # prompts for login + MFA code
  ```

  Copy its base64 output into a secret named `GARMIN_TOKENS`. (No email/password
  secret needed in this case.)

### 4. Run the sync

Repo **Actions → Garmin sync → Run workflow** to do the first pull immediately.
After that it runs hourly on its own and commits `rides.json`, which redeploys
Pages and updates the app. Older rides are preserved; each run only adds new ones
(within `LOOKBACK_DAYS`, default 120).

### 5. Install to your phone home screen

Open the Pages URL on your phone:

- **iPhone (Safari):** Share → **Add to Home Screen**.
- **Android (Chrome):** menu → **Install app** / **Add to Home screen**.

It launches full-screen like a native app.

### 6. Set your starting point

First launch shows sample data. Tap the **☰** on the Wax and Chain cards to set
the real "distance since last wax" and chain "lifetime distance" — from then on,
synced rides add on top automatically. Tap the small **Garmin · … ↻** line at the
bottom to force a refresh.

---

## Local development

```bash
# serve the folder
python3 -m http.server 4178      # then open http://localhost:4178

# after editing src/app.jsx, rebuild the compiled bundle:
node tools/build.mjs             # needs tools/babel.min.js (see below)
```

Source of truth for the UI is **`src/app.jsx`**; it compiles to **`app.js`**
(committed and served — no build step at runtime). React is vendored under
`vendor/` so the app has no CDN dependency.

`tools/babel.min.js` is git-ignored to keep the repo small. Re-fetch it when you
need to rebuild:

```bash
curl -sSL https://unpkg.com/@babel/standalone/babel.min.js -o tools/babel.min.js
```

The app icon is the "Chain Link" mark imported from the Claude design project.
`icons/icon-512.png` is the master; the other sizes are downscales of it:

```bash
sips -z 192 192 icons/icon-512.png --out icons/icon-192.png
sips -z 180 180 icons/icon-512.png --out icons/apple-touch-icon.png
sips -z 32  32  icons/icon-512.png --out icons/favicon-32.png
```

(iOS and Android round square icons themselves, so the square master is used for
the home-screen and maskable icons.)

## Files

| Path | Purpose |
|------|---------|
| `index.html` | PWA shell (loads vendored React + `app.js`, registers the service worker) |
| `src/app.jsx` → `app.js` | The app (edit the `.jsx`, rebuild to `.js`) |
| `manifest.webmanifest`, `sw.js`, `icons/` | Install + offline support |
| `rides.json` | Garmin ride log, written by the Action, read by the app |
| `sync/garmin_sync.py` | Pulls cycling activities from Garmin |
| `.github/workflows/sync.yml` | Hourly scheduled sync |
| `tools/` | Build script, icon generator, MFA token helper |

## Notes

- The hourly cron is GitHub's "best effort" — it can run a few minutes late, which
  is fine for maintenance tracking. Bump the schedule in `sync.yml` if you want.
- Indoor/virtual rides count toward wax & chain wear (they still wear the drivetrain).
  Adjust `is_cycling()` in `sync/garmin_sync.py` if you'd rather exclude them.
