# Quddix Twitch Pet Game

## Overview

This is an interactive Twitch chat game designed as a browser overlay for the **QUDDIX** Twitch channel. Viewers interact via Twitch chat commands to spawn and control virtual pets that wander around a colorful meadow scene. The app functions as both a standalone web page and an OBS browser source overlay (activated via `?transparent=true` URL parameter). The UI is localized in Russian.

Key features:
- Twitch chat integration: viewers type commands to spawn pets and perform actions
- Real-time WebSocket updates push game state to all connected clients
- Virtual pets wander the screen with physics-based animations
- Leaderboard showing top players by score
- Event banners for game announcements
- OBS transparent overlay mode for streaming

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses a three-directory monorepo pattern:
- **`client/`** — React SPA (Vite-based frontend)
- **`server/`** — Express.js backend with WebSocket support
- **`shared/`** — Shared types, schemas, and route definitions used by both client and server

### Frontend (`client/src/`)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: `wouter` (lightweight client-side router)
- **State Management**: `@tanstack/react-query` for REST data, custom `useGameWs` hook for WebSocket real-time state
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives, styled via Tailwind CSS with CSS variables
- **Animations**: `framer-motion` for pet movement, floating text, UI transitions
- **Icons**: `lucide-react` for pet representations (Cat, Dog, Rabbit, Bird, Turtle)
- **Fonts**: Nunito (body) and Fredoka (display/headings) — playful game aesthetic
- **Key pages**: `Town.tsx` is the main game view; supports transparent background mode for OBS
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### Backend (`server/`)
- **Framework**: Express.js running on Node.js with TypeScript (via `tsx`)
- **HTTP Server**: Node `http.createServer` wrapping Express, shared with WebSocket server
- **WebSocket**: `ws` library, mounted at `/ws` path on the same HTTP server
  - On connection: sends full game state to new client
  - Broadcasts pet spawns, actions, and events to all clients
- **Twitch Integration**: `tmi.js` client connects to the `quddix` channel (read-only, no auth needed for reading chat)
  - Chat messages are parsed for game commands
  - Commands trigger pet creation/updates and broadcast via WebSocket
- **API Routes**: Minimal REST API at `/api/pets` (GET) for listing all pets
- **Dev mode**: Vite dev server runs as middleware with HMR on `/vite-hmr` path
- **Production**: Vite builds static files to `dist/public`, served by Express

### Database
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod validation
- **Schema** (`shared/schema.ts`): Single `pets` table with columns:
  - `id` (serial PK)
  - `username` (unique text — Twitch username)
  - `petType` (text, default "cat")
  - `score` (integer, default 0)
  - `level` (integer, default 1)
  - `experience` (integer, default 0)
  - `health` (integer, default 100)
  - `lastAction` (timestamp, nullable)
- **Migrations**: Run `npm run db:push` (uses `drizzle-kit push`) — no migration files needed
- **Storage layer**: `server/storage.ts` implements `IStorage` interface with `DatabaseStorage` class using Drizzle queries

### WebSocket Message Protocol
Defined in `shared/schema.ts` as `WsMessage` union type:
- `state` — full game state (all pets)
- `spawn` — single new pet created
- `action` — a pet performed an action (includes score/level/exp/health changes)
- `event` — global game event message

### Build System
- **Dev**: `npm run dev` — runs `tsx server/index.ts` with Vite middleware
- **Build**: `npm run build` — runs `script/build.ts` which builds Vite frontend then bundles server with esbuild (output format: CJS, to `dist/index.cjs`)
- **Production**: `npm start` — runs `node dist/index.cjs`
- **Type check**: `npm run check` — runs `tsc --noEmit`

## External Dependencies

### Required Services
- **PostgreSQL** — Primary database, connected via `DATABASE_URL` environment variable. Uses `pg` Pool with `connect-pg-simple` for session storage capability
- **Twitch IRC** (via `tmi.js`) — Connects to Twitch chat for the `quddix` channel to read viewer commands. No authentication tokens required for read-only chat access

### Key NPM Packages
- `express` — HTTP server framework
- `ws` — WebSocket server
- `tmi.js` — Twitch Messaging Interface client
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `drizzle-zod` — Generates Zod schemas from Drizzle table definitions
- `@tanstack/react-query` — Server state management on the client
- `framer-motion` — Animation library for pet movements and UI effects
- `wouter` — Lightweight client-side routing
- `vite` — Frontend build tool and dev server
- `esbuild` — Server bundler for production builds
- `zod` — Runtime type validation (shared between client and server)
- shadcn/ui ecosystem: Radix UI primitives, `class-variance-authority`, `clsx`, `tailwind-merge`