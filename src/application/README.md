# Application

Import as `@application`.

Solid reactivity, query hooks, the play session, authoring, and the in-memory engine binding. Game rules are not written here. They are called through `@domain`.

| Area            | Role                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------- |
| `repositories/` | Bind the rules engine to in-memory stores. Not infrastructure. See the README in that folder. |
| `gameState/`    | `GameStateStore` and the projections of the subscribed game.                                  |
| `play/`         | Seat session, selection by phase, highlights, labels. Pure transitions stay pure.             |
| `queries/`      | TanStack Solid Query hooks and options for armies, cards, and games.                         |
| `authoring/`    | Draft editors and draft validation. Validation returns a result and does not throw.          |
| `signals/`      | Small UI signals that are not game state.                                                    |
| `bootstrap.ts`  | `createCore`. One core, built by `CoreProvider`.                                              |
| `*Context.tsx`  | Auth, server ports, and core. Hooks read the constant values `AppShell` mounted.             |

## Repositories

This is where we wire up the core rules engine with our in-memory stores.

**Important:** This is NOT Infrastructure, but a binding of core domain logic to the essential application coordinators that will be required.

Our intent is to mount the core once (likely in a context) so that it can be safely called or composed wherever necessary.

That note is also [`repositories/README.md`](./repositories/README.md). Both copies stay.

The port modules allocate new signals and maps per invocation. The core stack is constructed once, in `CoreProvider`, and consumed through `useCore()`.

## Solid

Query options are a function. Do not destructure a query store. Resolve ports once at hook setup and close over them. The full rules are [`STYLE.md`](../../STYLE.md) and [`.cursor/rules/solid-reactivity.mdc`](../../.cursor/rules/solid-reactivity.mdc).

## Related

- [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`../../DESIGN.md`](../../DESIGN.md)
- [`../../TESTING.md`](../../TESTING.md)
