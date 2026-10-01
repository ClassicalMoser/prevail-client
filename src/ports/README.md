# Ports

Import as `@ports`.

Interfaces for connecting with external infrastructure live here.

Composition (bootstrap / providers) wires concrete adapters from `@infrastructure` to these ports. This directory defines contracts only — no implementations.

That paragraph is also [`NOTE.md`](./NOTE.md). Both copies stay.

## What lives here

- `auth/` — `AuthPort`: session state, `subscribe`, access tokens, login, logout
- `server/` — `ServerPorts` for armies, unit cards, command cards, games, and the game seat

A port is a function bag. It does not fetch, and it does not touch Solid. Adapters in `@infrastructure` implement the functions. Application hooks call the ports through context, not through the adapters.

`RouteResponseError` is the error a server call throws when a route rejects. It is a value the contract needs, not an HTTP client.

## Related

- [`NOTE.md`](./NOTE.md)
- [`../infrastructure/README.md`](../infrastructure/README.md)
- [`../composition/README.md`](../composition/README.md)
- [`DESIGN.md`](../../DESIGN.md)
