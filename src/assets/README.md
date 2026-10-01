# Assets

Import as `@assets`.

Fonts, icons, and card layouts. No modules, no imports of other layers.

The alias is defined in [`vite.config.ts`](../../vite.config.ts) and in [`boundaries.ts`](../../boundaries.ts). `tsconfig.json` does not list `@assets`; a TypeScript file that needs a typed import of an asset uses the Vite client types and the Vite alias.

Only `@interface` may import this layer.
