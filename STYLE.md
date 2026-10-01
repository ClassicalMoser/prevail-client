# Style

Code shape for this repository. Import edges are in [`boundaries.ts`](./boundaries.ts). What each layer is for is [`LAYERS.md`](./LAYERS.md). The target layering is [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md). What the interface must do for a player is [`UI.md`](./UI.md).

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
- Dumb (`src/interface` presentational) does not call `useQuery` or context hooks. It reads `props.field()` in JSX only.
- Do not prop-drill a TanStack query store into a dumb child. Pass accessors built by the smart parent.

### Before shipping UI

- [ ] Every `useQuery` / `useMutation` uses a factory: `() => ({ ... })`
- [ ] No `{ data, isLoading } = query` anywhere
- [ ] No `({ foo, bar })` component params
- [ ] No `const x = props.foo` or `const x = signal()` at the top of a component body (except hook and store refs such as `const query = useQuery(...)`)
- [ ] Dumb components only see `Accessor<T>` props for changing data

## Tests

[`TESTING.md`](./TESTING.md).
