# Prevail Client

The client for Prevail: Ancient Battles. It is a Solid application, packaged with Tauri, that plays and authors against the shared rules engine.

The rules engine is `@classicalmoser/prevail-rules`. Wire contracts are `@classicalmoser/prevail-contracts`. This repository does not reimplement either.

## What this app does

- Renders a game from the engine's snapshots
- Turns a seat's input into a player-choice event and submits it
- Authors unit cards, command cards, and armies
- Signs in through Auth0 and calls the server through ports

Game legality, combat, and phase advance stay in the rules package. See [`DESIGN.md`](./DESIGN.md).

## Project structure

Each directory under `src/` is one layer. The index is [`LAYERS.md`](./LAYERS.md). Import edges are [`boundaries.ts`](./boundaries.ts).

The target layering and the current alignment are [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md).

## Development

How to run checks, and the standards for a change: [`CONTRIBUTING.md`](./CONTRIBUTING.md).

```bash
pnpm install
pnpm dev
pnpm test
pnpm validate
```

`pnpm dev` serves Vite on port 1420, which matches the Tauri dev URL. `pnpm tauri:dev` runs the native shell.

Path aliases (`@domain`, `@application`, `@ports`, `@infrastructure`, `@interface`, `@composition`, `@assets`) are in [`vite.config.ts`](./vite.config.ts). The TypeScript `paths` in [`tsconfig.json`](./tsconfig.json) cover the same aliases except `@assets`.

## Documentation

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — scripts and review checks
- [`STYLE.md`](./STYLE.md) — functions, files, commentary, Solid, tests
- [`DESIGN.md`](./DESIGN.md) — rules package, purity, immutability, events
- [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md) — target layering and current alignment
- [`LAYERS.md`](./LAYERS.md) — what each layer is for
- [`TESTING.md`](./TESTING.md) — how a spec is written
- [`src/AUDIT.md`](./src/AUDIT.md) — conventions audit
