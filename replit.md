# انطلاقة HPC

A static Arabic-language landing page for the HPC (انطلاقة) initiative. Features an animated floating-bubbles leaderboard, background image carousel, and a Telegram community link.

## Stack
- Pure HTML / CSS / JavaScript (no build step)
- Bootstrap 5 RTL (via CDN)
- Font Awesome 6 (via CDN)
- Google Fonts – Cairo

## Pages
- `index.html` — main landing page with animated bubbles
- `leaderboard.html` — leaderboard page

## Pages
- `admin.html` — password-protected admin page to manage the leaderboard

## How to run
```
python3 server.py
```
The workflow **Start application** is configured to do this automatically.
`server.py` serves all static files (identical to `python3 -m http.server`) plus two API
endpoints used by the admin panel:
- `GET  /api/leaderboard` — read `data/leaderboard.json`
- `POST /api/leaderboard` — write `data/leaderboard.json` (requires `X-Admin-Password` header)

### Admin password
Set the `ADMIN_PASSWORD` secret in Replit Secrets. Navigate to `/admin.html` and enter that
password to log in.

## User preferences
- Keep the existing project structure and static-site approach.
