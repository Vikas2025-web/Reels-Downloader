# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

- `insta-grabber` (`/`) — Instagram Reels & Stories downloader web app (React + Vite).
- `api-server` (`/api`) — shared Express API. Implements `/instagram/reel`, `/instagram/stories`, `/instagram/profile`, `/instagram/status` by proxying a RapidAPI scraper.

## Required environment variables

- `RAPIDAPI_KEY` — RapidAPI key for the Instagram scraper provider. Without it, the API returns 503 and the UI shows a configuration banner.
- `RAPIDAPI_HOST` (optional) — defaults to `instagram120.p.rapidapi.com`. Routes used: POST `/api/instagram/links` (reel/post by URL), POST `/api/instagram/stories` (by username), POST `/api/instagram/profile` (by username).

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
