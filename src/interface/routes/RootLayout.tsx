import { Outlet, useRouterState } from '@tanstack/solid-router';
import { AppNav } from '@interface/components';
import { Show } from 'solid-js';
import type { JSX } from 'solid-js';

/** Seat play: `/play/:gameId/white|black` — no global chrome. */
const isSeatPlayPath = (pathname: string): boolean =>
  /^\/play\/[^/]+\/(?:white|black)\/?$/u.test(pathname);

export function RootLayout(): JSX.Element {
  const hideAppNav = useRouterState({
    select: (state) => isSeatPlayPath(state.location.pathname),
  });

  return (
    <div class="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <Show when={!hideAppNav()}>
        <AppNav />
      </Show>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
