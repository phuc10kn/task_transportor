# Admin Web

Next.js App Router foundation for the CIS Operations Console.

Local development runs at `http://127.0.0.1:3001`; the Express API remains at `http://127.0.0.1:3000`.

## Local

Copy `.env.example` to `.env.local` and set `CIS_API_ORIGIN` to the Express API origin, then run `npm run dev` from this directory or `npm run admin:dev` from the repository root. For a local production smoke, run `npm run build` then `npm run start -- --port 8001`. The browser only uses relative `/api/v1/*`; `next.config.ts` rewrites those requests server-side. The default local value is `http://127.0.0.1:3000`. Express no longer serves the former static UI.

Pinned foundation: Next 16.2.10, React 19.2.7, TypeScript 5.9.3, Node >=20.9.0. `overrides.postcss=8.5.10` is required by the MUI-00 security preflight.

## UI foundation

MUI-11N locks the visual reference to NextAdmin Free source commit `a2c2bd50431705ed346bf338a89a146638d86087` from `NextAdminHQ/nextjs-admin-dashboard` (checked 2026-07-15). This app vendors no NextAdmin runtime, auth, ORM, database, demo route or data layer: shared shell, token and primitive code remain local in `components/` and continue to use the existing Express API/JWT contract.
