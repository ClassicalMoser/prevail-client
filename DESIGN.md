# Design

How the client is shaped. The layering target, the provider stack, and the current alignment are [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md). The layer index is [`LAYERS.md`](./LAYERS.md). Import edges are [`boundaries.ts`](./boundaries.ts). Code shape is [`STYLE.md`](./STYLE.md).

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

Solid reactivity stays in `src/application`: signals, stores, effects, query hooks, and context. The interface reads accessors the application built. The Solid rules are [`STYLE.md`](./STYLE.md).

## Immutability

Authoritative game state is an immutable snapshot from the rules engine.

- A transition returns a new state inside the rules package
- The client ingests that snapshot through `GameStateStore`
- Do not mutate a `GameState` in place
- Solid's store is the reactive projection of the snapshot, not a second rules engine

## Validation

Play validation stays in the rules package. It returns `ValidationResult` and does not throw. The client does not reimplement it.

Authoring validation in this repo follows the same idea. `validateArmyShape` and `validateArmyForMode` return `ArmyDraftValidationResult` (`{ success: true, data }` or `{ success: false, messages }`). They do not throw. A caller renders `messages`.

## Events

State changes go through the engine:

- A user action becomes a player-choice event
- `Core.handlePlayerChoiceSubmission` sends it
- The engine validates, applies or rejects, and publishes a snapshot
- `GameStateStore.ingest` is the only client write path for that snapshot

Ports are [`src/ports/README.md`](./src/ports/README.md). The in-memory engine binding is [`src/application/repositories/README.md`](./src/application/repositories/README.md).
