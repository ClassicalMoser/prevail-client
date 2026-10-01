# Composition

Import as `@composition`.

Root wiring. This layer is the only one that may import both `@infrastructure` and `@interface`.

`initializeAppDependencies` in `dependencies.ts` runs from `src/index.tsx` before the app renders. It builds the auth port and the server ports once. Those singletons are session-stable.

`AppShell` reads them and mounts:

`AuthContext.Provider` → `QueryClientProvider` → `ServerPortsContext.Provider` → `CoreProvider` → router

The provider values are constants, not signals. Auth state reactivity lives inside the auth port via `subscribe()`. Query client construction lives in `queryClient.ts` and is a singleton, same as the ports.

Do not construct a port, a query client, or a core inside a page.

## Related

- [`../ARCHITECTURE.md`](../ARCHITECTURE.md) — provider stack and current status
- [`../../DESIGN.md`](../../DESIGN.md)
- [`../ports/README.md`](../ports/README.md)
