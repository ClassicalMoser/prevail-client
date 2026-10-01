# Infrastructure

Import as `@infrastructure`.

Concrete adapters for the ports in `@ports`. This is the only layer that knows Auth0 and `fetch`.

| Area      | Role                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| `auth/`   | `createAuth0Port` implements `AuthPort`. Config is `auth0Config`.                 |
| `server/` | `createServerPorts` implements `ServerPorts`: HTTP, callers, resources, adapters. |

An adapter maps a wire response onto the port's return type. Schema failures are logged and surfaced as `RouteResponseError` or a rejected call. They are not swallowed.

This layer does not import `@application` or `@interface`. It does not create signals. Session-stable instances are built once in `@composition` and passed into context.

## Related

- [`../ports/README.md`](../ports/README.md)
- [`../composition/README.md`](../composition/README.md)
- [`../../LAYERS.md`](../../LAYERS.md)
