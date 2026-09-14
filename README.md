# BrewFlow

Full-stack café ordering and operations management system.

## Stack

- **Client:** React + JavaScript + Vite + Tailwind
- **Server:** Node.js + Express
- **Database:** MongoDB Atlas

## Getting started

```bash
npm install
npm run dev
```

- Client: http://localhost:5173
- Server health check: http://localhost:5000/health

### Run separately

```bash
npm run dev:client
npm run dev:server
```

### Tests

```bash
npm test
npm test -w client
```

### Format

```bash
npm run format
```

## Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose).

Copy `.env.example` to `.env` and set at least `JWT_SECRET` (and PayHere keys if you exercise payments). Local Compose overrides `MONGODB_URI` to the `mongo` service; you do not need Atlas for the default stack.

### Local stack (client + server + MongoDB)

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Client (nginx) | http://localhost:5173 |
| Server health | http://localhost:5000/health |
| MongoDB | localhost:27017 |

The client image reverse-proxies `/api` and `/socket.io` to the server on the Compose network (same-origin; leave `VITE_API_URL` empty).

Stop with `Ctrl+C` or `docker compose down`. Remove the DB volume with `docker compose down -v`.

### Production-like (Atlas)

Uses your `.env` `MONGODB_URI` (MongoDB Atlas). No local mongo container.

```bash
docker compose -f docker-compose.prod.yml up --build
```

### Notes

- Never commit `.env` or bake secrets into images.
- PayHere `notify_url` must still be publicly reachable (tunnel or deployed host); local Docker alone does not expose webhooks to PayHere.

## CI/CD (GitHub Actions)

Workflows live in `.github/workflows/`.

### CI (`ci.yml`)

Runs on every **push** and **pull_request**:

1. `npm ci`
2. `npm run lint`
3. Server Jest (ephemeral `mongo:7` service + CI env for `MONGODB_URI` / `JWT_SECRET`)
4. Client Jest
5. `npm run build -w client`
6. `docker build -f server/Dockerfile -t brewflow-server:ci .`

No GitHub Secrets are required for CI to pass.

### Deploy (`deploy-client.yml` / `deploy-server.yml`)

Run on push to **`main`**. Until deploy secrets are set, jobs **skip successfully** so `main` stays green.

| Workflow | Secrets |
|----------|---------|
| Deploy client (Vercel) | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| Deploy server (Railway) | `RAILWAY_DEPLOY_HOOK_URL`, optional `SERVER_HEALTH_URL` |

After pushing workflows to GitHub, open the repo **Actions** tab and confirm the CI run is green.

## Deployment (Vercel + Railway + Atlas)

Production cutover for Path A. Config files: [`vercel.json`](vercel.json), [`railway.toml`](railway.toml). **Never commit `.env` or cloud secrets.**

In cloud, the browser talks to the API with **`VITE_API_URL`** (cross-origin). Local Docker Compose keeps same-origin nginx proxy; production does not.

### 1. MongoDB Atlas

1. Create (or open) a cluster and database user.
2. Network Access: allow Railway (or `0.0.0.0/0` for a demo).
3. Copy the connection string → `MONGODB_URI`.

### 2. Railway (API)

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub → select **Brewflow**.
2. Root directory = repo root (uses `server/Dockerfile` via `railway.toml`).
3. Generate a public HTTPS domain for the service.
4. Set variables (Variables tab):

| Variable | Value |
|----------|--------|
| `MONGODB_URI` | Atlas URI |
| `JWT_SECRET` | long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_ORIGIN` | `https://<your-vercel-domain>` (set after step 3; update then redeploy) |
| `TAX_RATE` | `0.08` |
| `PAYHERE_MERCHANT_ID` | sandbox id |
| `PAYHERE_MERCHANT_SECRET` | sandbox secret |
| `PAYHERE_CURRENCY` | `LKR` |
| `PAYHERE_CHECKOUT_URL` | `https://sandbox.payhere.lk/pay/checkout` |
| `PAYHERE_NOTIFY_URL` | `https://<railway-host>/api/payments/notify` |
| `PAYHERE_RETURN_URL` | `https://<vercel-domain>/checkout/return` |
| `PAYHERE_CANCEL_URL` | `https://<vercel-domain>/checkout/cancel` |

5. Confirm health: `GET https://<railway-host>/health` → `{ "status": "ok" }`.
6. Settings → copy **Deploy Webhook** URL (for GitHub Secret `RAILWAY_DEPLOY_HOOK_URL`).

### 3. Vercel (client)

1. [vercel.com](https://vercel.com) → Import the same GitHub repo (root; uses `vercel.json`).
2. Environment variables (Production):

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://<railway-host>` (no trailing slash) |
| `VITE_UI_DEMO` | `true` until Phase 20 cleanup |

3. Deploy and copy the Vercel domain.
4. Go back to Railway and set `CLIENT_ORIGIN` (+ PayHere return/cancel URLs) to that domain; redeploy Railway if needed.
5. Redeploy Vercel after `VITE_API_URL` is correct (Vite bakes env at build time).

### 4. GitHub Secrets (optional auto-redeploy on push to `main`)

Repo → Settings → Secrets and variables → Actions:

- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `RAILWAY_DEPLOY_HOOK_URL`
- `SERVER_HEALTH_URL` = `https://<railway-host>/health`

### 5. Verify

1. Railway `/health` returns ok.
2. Open the Vercel URL — Home / Menu / About load.
3. Register or log in; confirm API calls succeed (no CORS errors in DevTools).
4. Reply in the project chat with both public URLs so Phase 19 can be marked fully verified.