# Testing

How to write a test. Code shape for a test is also [`STYLE.md`](./STYLE.md). The suite is run with the package scripts in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Where tests live

A spec is colocated with the module it exercises: `foo.ts` and `foo.test.ts` in the same directory.

Vite runs tests in the `node` environment and includes `src/**/*.test.ts` only. A component test that needs a DOM is not the current suite. Prefer extracting the pure function and testing that.

## What a test builds

Game state is built with the rules package.

- A factory builds a value from raw inputs (`createEmptyGameState`, `createUnitInstance`)
- A transform changes an existing state (`updatePhaseState`, and the other writes in `@classicalmoser/prevail-rules`)
- A fixture in this repo does what neither of those can

Do not give two of them the same job. If a factory or a transform can do it, there is no local fixture for it. Do not copy a rules-package helper into this repo to make a test easier.

`tempUnits` and `tempCommandCards` are stand-ins from the rules package until a catalog is wired through. Use them. Do not invent a second catalog in a test file.

## Shape

A test should be almost as easy to read as its name. The `it` title states the fact. The body shows that fact and little else. Do not start a title with "given" or "should".

Assert a value this test wrote. Do not assert a default some other helper filled in.

A helper used by one suite may stay in that file. The same helper in a second suite, when no factory or transform covers it, belongs in a shared testing module imported only by tests. Production code does not import it.

No type assertion (`as`, `!`) unless the test must pass a value the type forbids. That line carries a comment saying why, and it stays in the test file.

## What is worth a spec

Test a function that decides something:

- A projection from `GameState` to a view model
- A selection transition that returns the next plain selection
- Authoring validation
- A highlight or label derived from phase state

Do not wrap a component, a context hook, or an HTTP adapter in a unit test to prove a pure function. Pull the function out and test the function.

The rules engine's own coverage stays in `prevail-rules`. A client test that only re-asserts a rules-package result does not belong here.

## Commentary

When a setup does several steps, comment each step: what it writes, and why. A block comment on the first `describe` says what the file is proving when the title alone is not enough. Leave that commentary in place.

## Inventory

There is no coverage script in `package.json`. Do not treat a percentage in chat or in a report from another repo as this repo's number.

The conventions audit ([`src/AUDIT.md`](./src/AUDIT.md)) records which modules have a colocated spec. Until that pass, the five colocated specs under `src/application/play/` are the suite.
