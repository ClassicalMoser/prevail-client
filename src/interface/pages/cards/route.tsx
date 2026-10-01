import { lazyRouteComponent } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';

/** Code-split route entry for `/cards`; page module loads on first match. */
const CardBrowserRoute = lazyRouteComponent(
  () => import('./CardBrowserPage'),
  'CardBrowserPage',
);

const CardBrowserRoutePending = (): JSX.Element => (
  <p class="text-muted-foreground container mx-auto p-4 py-8">Loading cards…</p>
);

export { CardBrowserRoute, CardBrowserRoutePending };
