# Application

Import as `@application`.

Solid reactivity, query hooks, the play session, authoring, and the in-memory engine binding. Game rules are not written here. They are called through `@domain`.

| Area            | Role                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------- |
| `repositories/` | Bind the rules engine to in-memory stores. Not infrastructure. See the README in that folder. |
| `gameState/`    | `GameStateStore` and the projections of the subscribed game.                                  |
| `play/`         | Seat session, selection by phase, highlights, labels. Pure transitions stay pure.             |
| `queries/`      | TanStack Solid Query hooks and options for armies, cards, and games.                          |
| `authoring/`    | Draft editors and draft validation. Validation returns a result and does not throw.           |
| `bootstrap.ts`  | `createCore` (module-private to `CoreProvider`). One core per app.                            |
| `*Context.tsx`  | Auth, server ports, and core. Hooks read the constant values `AppShell` mounted.              |

The repositories note is [`repositories/README.md`](./repositories/README.md). Solid rules are [`../../STYLE.md`](../../STYLE.md).

## Related

- [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`../../DESIGN.md`](../../DESIGN.md)
- [`../../TESTING.md`](../../TESTING.md)
