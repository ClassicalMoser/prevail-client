# Interface

Import as `@interface`.

Views. What the interface must do for a player is [`../../UI.md`](../../UI.md). Layering is [`../ARCHITECTURE.md`](../ARCHITECTURE.md). Solid rules are [`../../STYLE.md`](../../STYLE.md).

`components/` and the views at this level (`board.tsx` and the rest) are presentational. Route pages under `pages/` are the smart edge. They may call application hooks. `routes/` creates the router once and exports it for `AppShell`.
