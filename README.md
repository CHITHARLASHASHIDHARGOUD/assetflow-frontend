# AssetFlow — Frontend

React 19  (Vite 7, Tailwind CSS v4) front end for the AssetFlow asset-management app. Talks to the standalone Spring Boot + MySQL backend (`assetflow-api.zip`).

## Requirements

- Node.js 20+ (or Bun 1.1+)
- The AssetFlow API running (default `http://localhost:8081`) — see the backend package

## Setup

```bash
npm install        # or: bun install
cp .env.example .env   # set VITE_API_BASE_URL to your API base URL
npm run dev        # starts the dev server (default port 8080)
```

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL of the AssetFlow Spring Boot API | `http://localhost:8081` |

The API's CORS allowlist must include this app's origin (e.g. `http://localhost:8080`).

## Roles

Authorization is enforced by the backend; the UI reads roles from `/api/auth/me`:

- **ADMIN** — full access, including Users & roles, Audit log, Settings
- **IT_MANAGER** — inventory, assignments, requests, maintenance, reports
- **EMPLOYEE** — My assets, My requests, My issues, My profile
- **AUDITOR** — read-only: Reports and Audit log

## Build & deploy

```bash
npm run build      # production build (Nitro/Vercel output)
```

The application is deployed on Vercel using TanStack Start and the Nitro Vite plugin (`vercel.json`). Configure `VITE_API_BASE_URL` in Vercel's Environment Variables with the URL of your deployed Render backend.
