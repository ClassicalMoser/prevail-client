# Style

Code shape for this repository. Import edges are in [`boundaries.ts`](./boundaries.ts). What each layer is for is [`LAYERS.md`](./LAYERS.md). The target layering and where the repo does not yet match it are in [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md).

The Solid rules in this file are the same rules as [`.cursor/rules/solid-reactivity.mdc`](./.cursor/rules/solid-reactivity.mdc). Both copies stay. Do not shorten one and leave the other as the only statement.

## Shape

Small functions, small files. One primary export per file. A function does one job. A name says what that job is.

No classes. Shared behavior is a function, or a closure that returns functions. Solid components are functions.

`return` stands on its own line and returns a name. Do not return a call. Do not build that call's arguments inline. Name each piece, then pass the names.

An exported function has an explicit return type.

No overloads, unless a single signature cannot say the return. An overload is a second assertion of the type.

```typescript
const groups = setupUnitsByType(units, placed);
const first = groups[0];
return first;
```

Components are PascalCase (`PlayPage.tsx`). Other modules are camelCase (`combatContextFromState.ts`). Filename case is left off in [`oxlint.config.ts`](./oxlint.config.ts).

## TypeScript

The project is strict. Do not use a type assertion (`as`, `!`) or `@ts-ignore`. The exception is a test that must pass a value the type forbids, and only in a `*.test.ts` file, with a comment on that line saying why.

Game shapes and rule schemas come from `@classicalmoser/prevail-rules`. Wire shapes come from `@classicalmoser/prevail-contracts`. Do not redeclare either beside the import.

## Commentary

Commentary is extensive. 25% comments is not too much. Leave existing function commentary in place, including `@param` and `@returns`. JSDoc-style comments ahead of declarations are good for IDE readability. A shorter header is not a cleanup. When a helper does several steps, comment each step: what it writes, and why.

## Solid

This project uses Solid, not React. React-style patterns compile but silently break reactivity.

### TanStack Solid Query

1. Query options are always a function: `useQuery(() => ({ queryKey, queryFn }))`. Never pass a plain options object.
2. Never destructure query or mutation results. No `const { data } = useQuery(...)`. Keep the store: `const query = useQuery(...)`, and read `query.data` / `query.isLoading` at consumption in JSX or reactive primitives.
3. Resolve context ports once when setting up the hook. Close over them in `queryFn` / `mutationFn`. Never call `useContext` inside async query work.

### Props and signals

4. Never destructure props. No `const UserCard = ({ name }) => ...`. Use `(props)` and read `props.name` in JSX. Use `mergeProps` / `splitProps` for defaults and splitting.
5. Never read a signal or store outside a reactive context. Do not copy one into `const x = ...` at component setup. Read in JSX, `createEffect`, `createMemo`, or an event handler at use time.
6. Dumb interface components receive accessors, not values. Pass `name={() => user.name()}`, not `name={user.name()}`. The leaf reads `props.name()` in JSX.
7. Derived values use `createMemo`. Do not write `const derived = signal()` at setup from other reactive sources.

### Smart and dumb

- Smart (pages, application hooks) owns queries, signals, and mutations, and passes accessors and callbacks down.
- Dumb (`src/interface` presentational components) does not call `useQuery` or context hooks. It reads `props.field()` in JSX only.
- Do not prop-drill a TanStack query store into a dumb child. Pass accessors built by the smart parent.

Idiomatic Solid control flow (`<Show>`, `<For>`) belongs in the interface when it is purely presentational. That is not the same as embedding domain logic or a new reactive source of truth.

Presentation-only derivation (sorting keys for a grid, CSS variables from props) may live in the interface. Domain-shaped derivation, and anything that feeds the rules engine, does not.

### Checklist before shipping UI

- [ ] Every `useQuery` / `useMutation` uses a factory: `() => ({ ... })`
- [ ] No `{ data, isLoading } = query` anywhere
- [ ] No `({ foo, bar })` component params
- [ ] No `const x = props.foo` or `const x = signal()` at the top of a component body (except hook and store refs such as `const query = useQuery(...)`)
- [ ] Dumb components only see `Accessor<T>` props for changing data

## Tests

How a test is written is [`TESTING.md`](./TESTING.md). The short form:

A test should be almost as easy to read as its name. The `it` title states the fact. The body shows that fact and little else. Do not start a title with "given" or "should".

A factory builds a value from raw inputs. A transform changes an existing state. Both live in `@classicalmoser/prevail-rules`. A local fixture does what neither of those can. Do not give two of them the same job. If a factory or a transform can do it, there is no fixture for it.

Assert a value this test wrote. Do not assert a default some other helper filled in.

A helper used by one suite may stay in that file. The same helper in a second suite, when no factory or transform covers it, belongs in a shared testing module imported only by tests. Production code does not import it.
