# Contributing

## Checks

Use the scripts in `package.json`. Do not call `vp`, `vitest`, `tsc`, `oxlint`, or `oxfmt` directly.

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint:fix
pnpm validate
```

`pnpm test` runs the colocated suite (`vp test run`).

`pnpm lint` runs Oxlint. `pnpm lint:fix` applies Oxlint fixes, including import order. It cannot fix an import that is circular or that names a module which does not exist.

`pnpm format` runs Oxfmt and rewrites files. `pnpm format:fix` runs Oxfmt with `--check` and does not rewrite.

`pnpm validate` is lint, format (the rewriting step), and typecheck. It does not run tests. Run `pnpm test` and `pnpm validate` often, and both before a commit.

Lint config is [`oxlint.config.ts`](./oxlint.config.ts), built from `classicalmoser-oxlint-config` with `jsx: 'solid'` and import boundaries from [`boundaries.ts`](./boundaries.ts). Filename case is off. Format config is [`oxfmt.config.ts`](./oxfmt.config.ts): single quotes, trailing commas, print width 80.

In an editor that type-checks as you type and applies fixes on save, a lot of this happens before you notice it. Agents and other setups do not share those defaults. Run `pnpm lint:fix`, `pnpm test`, and `pnpm validate` yourself.

## Standards

- [`STYLE.md`](./STYLE.md) — functions, files, commentary, Solid
- [`UI.md`](./UI.md) — semantics, accessibility, input, tokens, layout
- [`DESIGN.md`](./DESIGN.md) — rules package, purity, immutability, events
- [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md) — target layering, provider stack, current alignment
- [`LAYERS.md`](./LAYERS.md) — what each layer is for
- [`boundaries.ts`](./boundaries.ts) — which package may import which
- [`TESTING.md`](./TESTING.md) — how a spec is written and where it lives
- [`src/ports/README.md`](./src/ports/README.md) — ports are contracts only
- [`src/application/repositories/README.md`](./src/application/repositories/README.md) — the in-memory engine binding
