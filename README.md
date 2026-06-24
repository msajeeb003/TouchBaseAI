# TouchBaseAI

An AI-assisted lead follow-up automation platform. This repository is a monorepo
containing the backend API and the web frontend.

## Structure

| Folder | Stack | Description |
| --- | --- | --- |
| [`Follow-Up-Backend-main`](./Follow-Up-Backend-main) | Node.js, Express, TypeScript, Prisma, PostgreSQL | REST API: auth, leads, sequences, prompt templates, dashboard, and integrations (Twilio SMS/WhatsApp, Retell AI calling, Fathom transcripts, email/SMTP, AI providers). |
| [`Follow-up-frontend-main`](./Follow-up-frontend-main) | React, Vite, TypeScript, Redux Toolkit, shadcn/ui, Tailwind CSS | Web app: dashboard, lead management, sequence builder, templates, transcripts, settings, and docs. |

## Getting started

### Backend

```bash
cd Follow-Up-Backend-main
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY, etc.
npm install
npx prisma migrate deploy
npm run dev
```

### Frontend

```bash
cd Follow-up-frontend-main
pnpm install
pnpm dev
```

Set `VITE_BASE_URL` in `Follow-up-frontend-main/.env` to point at the backend API.

## Environment & secrets

- Backend secrets live in `Follow-Up-Backend-main/.env` (git-ignored). Use
  `.env.example` as the template.
- The frontend `.env` only holds the public API base URL that Vite bundles into
  the client; it contains no secrets.
