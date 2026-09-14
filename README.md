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

Run on push to **`main`**. Until Phase 19 secrets are set, jobs **skip successfully** so `main` stays green.

| Workflow | Secrets (Phase 19) |
|----------|-------------------|
| Deploy client (Vercel) | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| Deploy server (Render) | `RENDER_DEPLOY_HOOK_URL`, optional `SERVER_HEALTH_URL` |

After pushing workflows to GitHub, open the repo **Actions** tab and confirm the CI run is green.