# Composition

Import as `@composition`.

Root wiring. This layer is the only one that may import both `@infrastructure` and `@interface`.

`initializeAppDependencies` in `dependencies.ts` runs from `src/index.tsx` before the app renders. It builds the auth port and the server ports once. Those singletons are session-stable.

`AppShell` mounts the provider stack in [`../ARCHITECTURE.md`](../ARCHITECTURE.md).

Do not construct a port, a query client, or a core inside a page.

## Related

- [`../../DESIGN.md`](../../DESIGN.md)
- [`../ports/README.md`](../ports/README.md)
