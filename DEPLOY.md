# Deploying TouchBaseAI on Hetzner (Docker Compose)

This runs the **whole app** (frontend + backend) on a single Hetzner Cloud
server with automatic HTTPS via Caddy. The web app and the API are served from
the **same domain** — Caddy proxies `/api/*` to the backend — so there are no
CORS issues and the backend runs the every-minute send processor natively
(scheduled email / SMS / WhatsApp / AI calls).

```
                 ┌─────────── Hetzner server ───────────┐
  Browser ──443──▶  Caddy (HTTPS)                        │
                 │     ├── /api/*  ──▶ backend  (Node)   │ ──▶ Supabase Postgres
                 │     └── /*      ──▶ frontend (nginx)  │
                 └──────────────────────────────────────┘
```

## Prerequisites
- A Hetzner Cloud server — **CX22** or larger, **Ubuntu 24.04**.
- A **domain name** with an **A record** pointing to the server's public IP
  (required for HTTPS). IP-only testing is possible (see step 3).
- A **Postgres database** (this app is set up for **Supabase**) — you need its
  pooled connection strings.

---

## 1. Server setup (one time)
SSH in as root and install Docker:
```bash
curl -fsSL https://get.docker.com | sh
```
Open the firewall:
```bash
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

## 2. Get the code
```bash
git clone https://github.com/msajeeb003/TouchBaseAI.git
cd TouchBaseAI
```

## 3. Configure environment
```bash
cp .env.example .env
nano .env
```
Fill in every value. Generate the secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"  # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # ENCRYPTION_KEY
```
Set `DOMAIN` to your domain (e.g. `app.example.com`). For a quick IP-only test
without a domain, set `DOMAIN=:80` (HTTP only — webhooks/AI calls that need a
public HTTPS URL won't work until you add a domain).

## 4. Run database migrations (one time, fresh DB only)
```bash
docker compose run --rm backend npx prisma migrate deploy
```
Skip this if the database already has the schema.

## 5. Build and start
```bash
docker compose up -d --build
```
Caddy automatically obtains a Let's Encrypt certificate for your domain.
Watch the logs:
```bash
docker compose logs -f
```

Open **`https://your-domain.com`** and create an account.

---

## 6. Turn on the channels (AI, email, SMS, WhatsApp, calls)
All provider credentials are configured **per user, inside the app** (encrypted
in the database) — not in `.env`. After logging in, open **Settings** and add:

| Channel | What to add | Enables |
|---|---|---|
| **AI** | OpenAI / Gemini / Claude API key (+ model) | Sequence generation & message content |
| **Email** | SMTP host, port, username, password, from-name | Sending emails |
| **SMS** | Twilio Account SID, Auth Token, phone number | Sending SMS |
| **WhatsApp** | Twilio Account SID, Auth Token, WhatsApp number | Sending WhatsApp |
| **Calls** | Retell AI API key, agent ID, caller number | AI voice calls |

For **WhatsApp delivery status** and **Retell call callbacks**, point the webhook
URLs in your Twilio/Retell dashboards at:
```
https://your-domain.com/api/v1/webhooks/...
```
(`PUBLIC_BASE_URL` in `.env` must equal your domain.)

---

## Updating to new code
```bash
git pull
docker compose up -d --build
```

## Handy commands
| Action | Command |
|---|---|
| Status | `docker compose ps` |
| Logs (all) | `docker compose logs -f` |
| Logs (backend only) | `docker compose logs -f backend` |
| Restart | `docker compose restart` |
| Stop | `docker compose down` |
| Backend shell | `docker compose exec backend sh` |
| Re-run migrations | `docker compose run --rm backend npx prisma migrate deploy` |

## Troubleshooting
- **HTTPS cert not issued** → DNS A record must point to the server IP and ports
  80/443 must be open *before* `docker compose up`. Check `docker compose logs caddy`.
- **Backend can't reach DB** → verify `DATABASE_URL` (transaction pooler, port
  6543) in `.env`; `docker compose logs backend` should print
  `Database connected successfully`.
- **AI generation returns 400** → add an AI API key in Settings.
