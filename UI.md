# UI

What the interface must do for a player. Code shape is [`STYLE.md`](./STYLE.md). Layering is [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md). Design principles are [`DESIGN.md`](./DESIGN.md). This file covers semantics, accessibility, input, tokens, and layout.

This is a stopgap. It holds until the presentation definitions layer exists. When a rule here conflicts with that layer, the layer wins.

## Targets

- Desktop browser first: Chrome, Firefox, Safari
- Tauri comes later. A feature that uses a Tauri API has a browser path first
- Floor: 1280×800 viewport. Everything works there
- Zoom: usable at 150% browser zoom
- Phone: playable. Not tuned

## Elements

Use the native element first. ARIA fills gaps. It does not replace an element.

- An action is a `<button>`. Navigation is an `<a>`
- A group of inputs is a `<fieldset>` with a `<legend>`
- An input has a `<label>`
- A set of items is a `<ul>` or `<ol>`
- Tabular data is a `<table>` with `<th>`
- Headings go in order. Do not skip a level
- One `<main>` per page. Use `<nav>`, `<aside>`, and `<section>` with a heading

Do not put a click handler on a `<div>` or `<span>`.

## Names and state

A player reads names. A screen reader reads names. Both get the same meaning.

- Accessible names and state text come from `src/application`. They are pure functions with a colocated spec
- The interface renders the string it is given. It does not build one from domain values
- A name says what the thing is and its state: "C4, Velites facing north, legal move". Not "3-4"
- Never show a player an internal value: a `choiceType`, an event number, an id, an enum key

## ARIA

- `aria-pressed` is for a toggle that is on or off. Nothing else
- `aria-label` goes on an interactive element or a landmark. It does nothing on a plain `<div>`
- A control that can't be used right now is `disabled`. Use `aria-disabled` only when it must stay focusable to explain why
- Phase changes and the result of a submitted choice are announced through one polite live region. Owned by the page, not by each component

## Input

- Nothing is reachable only by hover. Hover may add to something. It may not be the only way in
- Card previews open on hover, on focus, and on an explicit action (click, Enter, long-press)
- Every action works by keyboard. Tab order follows reading order
- Focus is always visible. Do not remove an outline without a replacement
- After an action, focus goes somewhere sensible. It is never lost to `<body>`
- Escape cancels a staged selection or closes the top layer
- Shortcuts are single keys, only while focus is in the game, and never override a browser shortcut
- Pointer targets are at least 24×24 CSS px. Prefer 44 for primary actions

## Tokens

- Colors, radii, shadows, fonts, and spacing come from theme tokens in `src/styles/app.css`
- No raw color values in components or page CSS. No hex, `oklch()`, or `rgb()` outside the theme
- A new value is a new token in the theme. Then use the token
- Page-local variables (`--play-*`) are being retired. Do not add new ones
- Text and its background meet WCAG AA contrast: 4.5:1 for body text, 3:1 for large text and UI boundaries

## Layout

- Intrinsic first. Flex and grid that adapt to their space
- A component sizes to its container. Use container queries, not viewport breakpoints
- Viewport breakpoints live only in the page shell
- Use `rem` for type and spacing. Use `px` only for hairlines
- No fixed heights on anything that holds text
- Respect `prefers-reduced-motion`

## Components

Use the primitives in `src/interface/components` first.

- Complex widgets come from Kobalte: dialog, popover, tooltip, select, combobox, tabs, number field, toggle group
- Do not hand-roll a widget Kobalte provides
- A new primitive is copied from the Zaidan registry, then styled with tokens only
- A number input is Kobalte's number field. Not `<input type="number">` with `onInput`

## Known violations

These exist in the code now. Do not copy them. Fix one only when your task already touches that file. Do not start a sweep.

- Board cells are named by raw coordinate (`board.tsx`)
- The facing-picker cell is a `<div>` with `aria-label` (`board.tsx`)
- Unit and card previews are hover-only (`board.tsx`, `published-card-thumb.tsx`)
- Hand cards use `aria-pressed` for "legal" (`PlayHandStrip.tsx`)
- Army unit count is a raw number input that commits on each keystroke (`army-units-section.tsx`)
- The theme is still shadcn's gray. Prevail's palette lives in `--play-*` in `play.css`
- `src/styles/zaidan-vega.css` holds styles for about 51 components. About 7 are used
- Tauri template leftovers: the `greet` command, `useGreetMsg`, `useName`, and the unused dialog plugin

## Before shipping UI

- [ ] Every interactive element is a native interactive element
- [ ] Every name and state string comes from the application layer
- [ ] No internal value is visible to a player
- [ ] Nothing depends on hover alone
- [ ] The change works by keyboard, with visible focus
- [ ] No raw color, and no new page-local variable
- [ ] It holds at 1280×800 and at 150% zoom
