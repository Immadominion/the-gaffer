# The Gaffer — Web

The frontend for **The Gaffer** (Walrus Memory World Cup). Next.js (App Router) +
TypeScript + Tailwind v4. This is the **UI layer only** for now — every screen reads
from a mock data layer (`lib/data.ts`) behind a clean seam, so dropping in the live
tRPC client (the backend's `AppRouter`) + Privy auth later is a swap, not a rewrite.

Lives in `web/` alongside the Bun/tRPC backend (repo root). Deploys to **Vercel**;
backend stays on **Railway**.

## Run

```bash
bun install
bun run dev        # http://localhost:3000
bun run build      # production build (also typechecks)
```

## Screens

Built 1:1 from the Claude Design reference (`Landing` + `The Touchline - Web` +
`The Gaffer - Web App`):

| Route        | Screen                                  |
| ------------ | --------------------------------------- |
| `/`          | Landing                                 |
| `/touchline` | The Touchline (home hub)                |
| `/call`      | Make a Call (predict + stake)           |
| `/gaffer`    | The Gaffer (chat / roast)               |
| `/dossier`   | My Dossier (memory + timeline)          |
| `/ladder`    | Squad Ladder (leaderboard + pot)        |
| `/wallet`    | Wallet (balance + activity)             |
| `/verdict`   | The Verdict (post-result share card)    |
| `/stats`     | Stats (placeholder for the nav icon)    |

## The Gaffer in 3D

`components/Gaffer3D.tsx` wraps Google `<model-viewer>`. **Mood is state** — each
screen passes the model that fits the moment (`smug` / `thinking` / `roast` /
`neutral` / `disappointed` / `approving`), mapped to the `.glb` files in
`public/models/` by `lib/gaffer.ts`. It's drag-to-orbit + idle float, lazy-loaded
on scroll with the 2D `gaffer.png` as a poster so the heavy model never blocks first
paint. Small chat/squad avatars use the flat 2D render for speed.

3D moments: landing hero (`smug`), Touchline feature (`thinking`), Verdict
(`disappointed`).

> **TODO before prod:** the `.glb` models are raw ~25–30 MB exports. meshopt-compress
> them (Draco was misbehaving) to cut bandwidth/first-paint. Optionally rig idle
> animation in Blender. Tracked, not blocking the UI.

## Theme

The Gaffer's own football-green palette (not the shared design-system base): green
`#0BA14A` / `#14B85A`, dark "ink" cards `#0E1A14→#13251B`, paper `#F4F7F2`. Fonts:
Clash Display (headings) + Satoshi (body) + JetBrains Mono (numbers). Icons: Phosphor.
Tokens live in `app/globals.css`.

## Deploy (Vercel)

Set the project's **Root Directory** to `web` (this is a monorepo; the repo root is
the backend). Set `NEXT_PUBLIC_SITE_URL` to the deployed origin. See `.env.example`.
