# Client audit

Running checklist for a manual, end-to-end conventions audit of this client (layers, import boundaries, Solid reactivity, commentary, colocated tests). Work up the dependency tree. Check a box only when that directory has been walked and brought in line.

The walk has not started.

**Criteria:** [`STYLE.md`](../STYLE.md), [`DESIGN.md`](../DESIGN.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`LAYERS.md`](../LAYERS.md), [`boundaries.ts`](../boundaries.ts), [`TESTING.md`](../TESTING.md), [`.cursor/rules/solid-reactivity.mdc`](../.cursor/rules/solid-reactivity.mdc), [`ports/NOTE.md`](./ports/NOTE.md), and [`application/repositories/README.md`](./application/repositories/README.md).

**Last updated:** 2026-09-30

---

## Progress order

Audit in this order (dependencies flow downward):

1. `domain/`
2. `ports/`
3. `application/` — `repositories`, `gameState`, `play`, `queries`, `authoring`, `signals`, then bootstrap and contexts
4. `infrastructure/`
5. `interface/` — presentational components, then pages and routes
6. `composition/` and `src/index.tsx`
7. Suite: `pnpm test`, then `pnpm validate`

---

## Layers

### `domain/` (`@domain`)

- [ ] `domain/`

### `ports/` (`@ports`)

- [ ] `ports/`
  - [ ] `auth/`
  - [ ] `server/`

### `application/` (`@application`)

- [ ] `repositories/`
- [ ] `gameState/`
- [ ] `play/`
  - [ ] `selection/`
  - [ ] `seatPlayActions/`
- [ ] `queries/`
- [ ] `authoring/`
- [ ] `signals/`
- [ ] Bootstrap and contexts (`bootstrap.ts`, `coreContext.tsx`, `authContext.tsx`, `serverPortsContext.tsx`)

### `infrastructure/` (`@infrastructure`)

- [ ] `auth/`
- [ ] `server/`

### `interface/` (`@interface`)

- [ ] Presentational components
- [ ] `pages/`
- [ ] `routes/`

### `composition/` (`@composition`)

- [ ] `composition/`
- [ ] `src/index.tsx`

### Suite

- [ ] `pnpm test`
- [ ] `pnpm validate`
