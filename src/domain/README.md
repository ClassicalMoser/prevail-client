# Domain

Import as `@domain`.

Builds the rules-package game runner and re-exports the port types that runner needs. It does not contain rules. It does not import `solid-js`.

`createEngine` calls `createGameRunner` from `@classicalmoser/prevail-rules/application`. Callers pass `EnginePorts` in and get a `GameRunner` back.

This directory depends on the rules package only. It does not import `@application`, `@ports`, `@infrastructure`, or `@interface`.

## What stays out

Legality, validation of play, expected events, procedures, and state transitions stay in `prevail-rules`. The client submits a player choice and ingests the snapshot. See [`DESIGN.md`](../../DESIGN.md).

## Related

- [`LAYERS.md`](../../LAYERS.md)
- [`DESIGN.md`](../../DESIGN.md)
- [`ARCHITECTURE.md`](../ARCHITECTURE.md)
