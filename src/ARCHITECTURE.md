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

## Layer map

| Area              | Role                                                                    |
| ----------------- | ----------------------------------------------------------------------- |
| `src/domain`      | Ports and engine wiring that depend only on domain packages (no Solid). |
| `src/application` | Solid reactivity, in-memory adapters, bootstrap, future context.        |
| `src/interface`   | Views: props in, DOM out; `Show` / `For` as needed.                     |

## Current status

**Aligned:** The core stack is created once in `CoreProvider` (`src/index.tsx`); `useCore()` reads that instance. Board-level state derivation (`subscribedBoard`) lives in `createCore`. Demo-only unit visuals are a separate concern in `boardCellDemo.ts` and are wired from the composition root (`App`), not from `Core`.

**Still evolving:** `BoardComponent` still derives grid layout from `board` via local `createMemo` (acceptable as presentation-only, but could move if you want the interface even thinner). Further features should extend the `Core` API or dedicated application modules rather than re-calling `useEngineServices` from the UI.

When touching features, prefer nudging code toward the target boundaries rather than widening new exceptions.
