# Interface

Import as `@interface`.

Views. Accessors and callbacks in, DOM out.

Presentational components (`components/`, `board.tsx`, and the other views at this level) do not call `useQuery`, `useContext`, or engine services. They read `props.field()` in JSX. Pass accessors down, not values. `<Show>` and `<For>` belong here when the choice is presentational.

Route pages under `pages/` are the smart edge. They may call application hooks and pass accessors into the presentational children. They do not own a second game runner.

Routes live in `routes/`. The router is created once and exported for `AppShell`.

## Still evolving

`BoardComponent` derives grid layout from `board` with a local `createMemo`. That derivation is presentation-only. Further features extend `Core` or an application module. They do not call engine services from the UI.

The full target is [`../ARCHITECTURE.md`](../ARCHITECTURE.md). The Solid checklist is [`../../STYLE.md`](../../STYLE.md).

## Related

- [`../../STYLE.md`](../../STYLE.md)
- [`.cursor/rules/solid-reactivity.mdc`](../../.cursor/rules/solid-reactivity.mdc)
- [`../application/README.md`](../application/README.md)
