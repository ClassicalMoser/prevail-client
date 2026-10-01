# Design

How the client is shaped. Package layout is in [`LAYERS.md`](./LAYERS.md). Who may import whom is [`boundaries.ts`](./boundaries.ts).

[`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md) is the target layering, the provider stack, and the current alignment. It is normative. This file does not replace it. The principles, the stack, and the status below are the same standard, restated so a change to one document has to be made in both.

## The rules package

Game rules live in `@classicalmoser/prevail-rules`. This repository does not contain a second rules engine.

- `src/domain` builds a `GameRunner` from that package and nothing else
- Legality, validation of play, expected events, procedures, and state transitions stay in the rules package
- The client submits a player choice and ingests the snapshot the engine publishes
- The client does not apply an event, enumerate legal moves, or decide the next phase on its own

HTTP and auth payloads that are not game state come from `@classicalmoser/prevail-contracts`.

## Pure functions

Projection and selection code that turns plain values into plain values is pure:

- No I/O inside the function
- No reading or writing a signal, a store, or the DOM
- Same input always produces the same output

Solid reactivity stays in `src/application`: signals, stores, effects, query hooks, and context. The interface reads accessors the application built.

## Immutability

Authoritative game state is an immutable snapshot from the rules engine.

- A transition returns a new state inside the rules package
- The client ingests that snapshot through `GameStateStore`
- Do not mutate a `GameState` in place
- Solid's store is the reactive projection of the snapshot, not a second rules engine

## Type safety

TypeScript is strict.

- An exported function has an explicit return type
- No type assertions (`as`, `!`) and no `@ts-ignore`. A test of an unreachable case is the exception, only in a test file, and the line carries a comment
- No overloads unless one signature cannot express the return
- Manual types stay aligned with the rules and contracts packages. Do not hand-write a parallel schema for a shape those packages already export

## Target principles

### 1. Interface stays dumb

Components receive signals (`Accessor<T>`) and callbacks (or small config objects). They render and forward user intent. They do not own application state or orchestrate the rules engine.

Idiomatic Solid is encouraged here: control flow such as `<Show>` and `<For>` belongs in the interface when it is purely presentational (conditional layout, lists). That is not the same as embedding domain logic or new reactive sources of truth.

Presentation-only derivation (sorting keys for a grid, CSS variables from props) may live in the interface. Domain-shaped derivation and anything that feeds the engine should not.

Route pages under `src/interface/pages` are the smart edge. They may call application hooks. Presentational components do not.

### 2. Domain stays pure

Schemas, types, and pure functions. No `solid-js`. No browser assumptions. The rules package and the client's domain module stay testable and portable without the UI runtime.

### 3. Application manages state

All signal composition and derivation that reflects game and application state is coordinated under `src/application` (bootstrap, context, port implementations, subscribers). The domain is invoked with plain values. The application layer turns engine and storage behavior into reactive values the UI can read.

The in-memory port modules under `application/repositories` allocate new signals and maps per invocation. The core stack is constructed once (at the app root via a provider) and consumed through a single API so there is one source of truth.

### 4. Composition stays readable

Wiring is easy to find: either a thin root that only passes props and handlers into the interface, or an explicit composition module (bootstrap / `createCore` / context) that builds the stack once and exposes a narrow surface. Do not scatter `createSignal` and engine wiring across interface files.

### 5. Solid reactivity and TanStack Solid Query

Hard rules, also in [`STYLE.md`](./STYLE.md) and [`.cursor/rules/solid-reactivity.mdc`](./.cursor/rules/solid-reactivity.mdc):

**Query**

- Options are always a function: `useQuery(() => ({ queryKey, queryFn }))`.
- Never destructure query or mutation stores (`const { data } = useQuery(...)`).
- Keep the store (`const query = useQuery(...)`) and read `query.data`, `query.isLoading` in JSX or reactive primitives.
- Resolve context ports once at hook setup. Close over them in `queryFn` / `mutationFn`.

**Props and dumb components**

- Never destructure props. Use `(props)` and read `props.field` in JSX. Use `mergeProps` / `splitProps` for defaults.
- Pass accessors down, not values: `name={() => query.data?.name}`, not `name={query.data?.name}`.
- Dumb interface components read `props.accessor()` in JSX. They do not call `useQuery` or context hooks.
- Smart pages and hooks own queries and pass accessor props to presentational children.
- Use `createMemo` for derived display values. Do not assign reactive reads to `const` at component setup.

**Layering**

- `src/interface` presentational: accessors and callbacks in, DOM out.
- `src/application`: queries, signals, editor state, view-model accessors for pages.

## Layers

Each directory under `src/` is one layer. Who may import whom is [`boundaries.ts`](./boundaries.ts). What each layer is for is [`LAYERS.md`](./LAYERS.md).

Layer map, as in [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md):

| Area                 | Role                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `src/domain`         | Ports and engine wiring that depend only on domain packages (no Solid).                  |
| `src/application`    | Solid reactivity, in-memory adapters, bootstrap, context, query hooks.                   |
| `src/interface`      | Views: props in, DOM out; `Show` / `For` as needed. call signals to maintain reactivity. |
| `src/composition`    | Root wiring: providers, query client, auth and server port construction.                 |
| `src/infrastructure` | Auth0, HTTP adapters implementing port interfaces.                                       |

## Ports

Interfaces for external infrastructure live in `src/ports`. Composition wires concrete adapters from `@infrastructure` to these ports. The directory defines contracts only. No implementations. The short form is [`src/ports/NOTE.md`](./src/ports/NOTE.md).

## Repositories

`src/application/repositories` wires the rules engine to in-memory stores. It is not infrastructure. It is the binding of core domain logic to the application coordinators the client requires. The core is mounted once, in a context, so it can be called or composed from one place. The short form is [`src/application/repositories/README.md`](./src/application/repositories/README.md).

## Validation

Play validation stays in the rules package. It returns `ValidationResult` and does not throw. The client does not reimplement it.

Authoring validation in this repo follows the same idea. `validateArmyShape` and `validateArmyForMode` return `ArmyDraftValidationResult` (`{ success: true, data }` or `{ success: false, messages }`). They do not throw. A caller renders `messages`.

## Events

State changes go through the engine:

- A user action becomes a player-choice event
- `Core.handlePlayerChoiceSubmission` sends it
- The engine validates, applies or rejects, and publishes a snapshot
- `GameStateStore.ingest` is the only client write path for that snapshot

## Provider stack

The async auth port is resolved once at startup in `composition/dependencies.ts` (`initializeAppDependencies`), invoked from the entry (`src/index.tsx`) before the app renders. The resulting port singletons are session-stable, so `AppShell` mounts the contexts with constant values:

`AuthContext.Provider` → `QueryClientProvider` → `ServerPortsContext.Provider` → `CoreProvider` → router

Contexts are defined, with their consumer hooks, in `src/application`. `AppShell` mounts the providers with the singletons. Because the values are constants (not reactive props), the provider boundary carries no implied reactivity. Auth state reactivity lives inside the port via `subscribe()`. Server and auth ports are consumed via their context hooks under this tree. Query hooks resolve ports inside their reactive factory. Mutation hooks resolve ports and the query client once at hook setup and close over them in `mutationFn` / `onSuccess`.

## Current status

**Aligned:** Dependencies are built once at startup (outside the reactive system) and provided as constant singletons, mirroring `queryClient`. The core stack is created once in `CoreProvider`. `useCore()` reads that instance. Authoritative game snapshots live in `GameStateStore` (ingest seam for the local engine today and a future transport). `core.game.*` exposes projection accessors. Authoring query and mutation hooks resolve ports synchronously under the provider tree.

**Still evolving:** `BoardComponent` still derives grid layout from `board` via local `createMemo` (acceptable as presentation-only, and a candidate to move if the interface gets thinner). Further features extend the `Core` API or a dedicated application module. They do not call engine services from the UI.

When touching features, prefer nudging code toward the target boundaries rather than widening new exceptions.
