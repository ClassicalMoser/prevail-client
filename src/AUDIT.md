# Client audit

Running checklist for a manual, end-to-end conventions audit of this client (layers, import boundaries, Solid reactivity, commentary, colocated tests). Work up the dependency tree. Check a box only when that directory has been walked and brought in line.

The full walk is in progress. Application complete; infrastructure seat outbound parse extracted. Next: `interface/`.

**Criteria:** [`STYLE.md`](../STYLE.md), [`UI.md`](../UI.md), [`DESIGN.md`](../DESIGN.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`LAYERS.md`](../LAYERS.md), [`boundaries.ts`](../boundaries.ts), [`TESTING.md`](../TESTING.md), [`ports/README.md`](./ports/README.md), and [`application/repositories/README.md`](./application/repositories/README.md).

**Criteria:** [`STYLE.md`](../STYLE.md), [`UI.md`](../UI.md), [`DESIGN.md`](../DESIGN.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`LAYERS.md`](../LAYERS.md), [`boundaries.ts`](../boundaries.ts), [`TESTING.md`](../TESTING.md), [`ports/README.md`](./ports/README.md), and [`application/repositories/README.md`](./application/repositories/README.md).

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

- [x] `domain/`

### `ports/` (`@ports`)

- [x] `ports/`
  - [x] `auth/`
  - [x] `server/`

### `application/` (`@application`)

- [x] `repositories/`
- [x] `gameState/`
- [x] `play/`
  - [x] `selection/`
  - [x] `seatPlayActions/`
  - [x] `hints/`
- [x] `queries/`
- [x] `authoring/`
- [x] `signals/` (removed — Tauri leftovers)
- [x] Bootstrap and contexts (`bootstrap.ts`, `coreContext.tsx`, `authContext.tsx`, `serverPortsContext.tsx`)

### `infrastructure/` (`@infrastructure`)

- [x] `auth/`
- [x] `server/`

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
