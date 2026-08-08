# Architecture

This document describes the **target** layering for Prevail client code. It also states plainly where the repo **does not yet** match that target.

## Target principles

### 1. Interface stays dumb

Components receive **signals** (`Accessor<T>`) and **callbacks** (or small config objects). They render and forward user intent; they do not own application state or orchestrate the rules engine.

**Idiomatic Solid is encouraged here:** control flow such as `<Show>` and `<For>` belongs in the interface when it is purely presentational (conditional layout, lists). That is not the same as embedding domain logic or new reactive sources of truth.

Presentation-only derivation (sorting keys for a grid, CSS variables from props) may live in the interface; **domain-shaped** derivation and anything that feeds the engine should not.

### 2. Domain stays pure

Schemas, types, and **pure** functions—no `solid-js`, no browser assumptions. The rules package and shared domain code remain testable and portable without the UI runtime.

### 3. Application manages state

All **signal composition and derivation** that reflects game/application state is coordinated under `src/application` (bootstrap, context, port implementations, subscribers). The domain is invoked with plain values; the application layer turns engine and storage behavior into reactive values the UI can read.

The in-memory port modules under `application/repositories` allocate new signals and maps **per invocation**; the core stack should be **constructed once** (e.g. at the app root via a provider) and consumed through a single API so there is one source of truth.

### 4. Composition stays readable

Wiring is easy to find: either a thin root that only passes props/handlers into the interface, or an explicit **composition** module (bootstrap / `createCore` / context) that builds the stack once and exposes a narrow surface. Avoid scattering `createSignal` and engine wiring across many interface files.

### 5. Solid reactivity and TanStack Solid Query

Hard rules (see also `.cursor/rules/solid-reactivity.mdc`):

**Query**

- Options are **always a function**: `useQuery(() => ({ queryKey, queryFn }))`.
- **Never destructure** query/mutation stores (`const { data } = useQuery(...)`).
- Keep the store (`const query = useQuery(...)`) and read `query.data`, `query.isLoading` in JSX or reactive primitives.
- Resolve context ports once at hook setup; close over them in `queryFn` / `mutationFn`.

**Props and dumb components**

- **Never destructure props.** Use `(props)` and read `props.field` in JSX. Use `mergeProps` / `splitProps` for defaults (see UI primitives).
- **Pass accessors down, not values:** `name={() => query.data?.name}`, not `name={query.data?.name}`.
- Dumb interface components read `props.accessor()` in JSX; they do not call `useQuery` or context hooks.
- Smart pages/hooks own queries and pass accessor props to presentational children.
- Use `createMemo` for derived display values; do not assign reactive reads to `const` at component setup.

**Layering**

- `src/interface` presentational: accessors + callbacks in, DOM out.
- `src/application`: queries, signals, editor state, view-model accessors for pages.

## Layer map

| Area                 | Role                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `src/domain`         | Ports and engine wiring that depend only on domain packages (no Solid).                  |
| `src/application`    | Solid reactivity, in-memory adapters, bootstrap, context, query hooks.                   |
| `src/interface`      | Views: props in, DOM out; `Show` / `For` as needed. call signals to maintain reactivity. |
| `src/composition`    | Root wiring: providers, query client, auth and server port construction.                 |
| `src/infrastructure` | Auth0, HTTP adapters implementing port interfaces.                                       |

## Provider stack

The async auth port is resolved once at startup in `composition/dependencies.ts` (`initializeAppDependencies`), invoked from the entry (`src/index.tsx`) before the app renders. The resulting port singletons are session-stable, so `AppShell` mounts the contexts with **constant** values:

`AuthContext.Provider` → `QueryClientProvider` → `ServerPortsContext.Provider` → `CoreProvider` → router

Contexts are defined (with their consumer hooks) in `src/application`; `AppShell` mounts the providers with the singletons. Because the values are constants (not reactive props), the provider boundary carries no implied reactivity—auth state reactivity lives inside the port via `subscribe()`. Server and auth ports must be consumed via their context hooks under this tree. Query hooks resolve ports inside their reactive factory; mutation hooks resolve ports/client once at hook setup and close over them in `mutationFn` / `onSuccess`.

## Current status

**Aligned:** Dependencies are built once at startup (outside the reactive system) and provided as constant singletons—mirroring `queryClient`. The core stack is created once in `CoreProvider`; `useCore()` reads that instance. Authoritative game snapshots live in `GameStateStore` (ingest seam for the local engine today and a future transport); `core.game.*` exposes projection accessors. Authoring query/mutation hooks resolve ports synchronously under the provider tree.

**Still evolving:** `BoardComponent` still derives grid layout from `board` via local `createMemo` (acceptable as presentation-only, but could move if you want the interface even thinner). Further features should extend the `Core` API or dedicated application modules rather than re-calling engine services from the UI.

When touching features, prefer nudging code toward the target boundaries rather than widening new exceptions.
