# Layers

Each directory under `src/` is one layer. Import edges are enforced from [`boundaries.ts`](./boundaries.ts). Longer notes stay in the layer README.

| Layer                                            | Import            | Role                                                                                             |
| ------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------ |
| [Domain](./src/domain/README.md)                 | `@domain`         | Build the rules-package `GameRunner`. No Solid, no rules of its own.                             |
| [Ports](./src/ports/README.md)                   | `@ports`          | Contracts for auth and the server. No implementations.                                           |
| [Application](./src/application/README.md)       | `@application`    | Signals, stores, query hooks, play session, authoring, the in-memory engine binding.             |
| [Infrastructure](./src/infrastructure/README.md) | `@infrastructure` | Auth0 and HTTP adapters that implement the ports.                                                |
| [Interface](./src/interface/README.md)           | `@interface`      | Views. Presentational components take accessors and callbacks. Pages may call application hooks. |
| [Composition](./src/composition/README.md)       | `@composition`    | Root wiring: one-time dependency init, providers, the router.                                    |
| [Assets](./src/assets/README.md)                 | `@assets`         | Fonts, icons, card layouts. No TypeScript of its own.                                            |

`src-tauri/` is the native shell. It is outside the TypeScript boundaries.

The target layering, the provider order, and where the tree does not yet match are [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md). The design principles are [`DESIGN.md`](./DESIGN.md).
