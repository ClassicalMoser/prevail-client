import { Outlet } from '@tanstack/solid-router';
import { AppNav } from '@interface/components';
import type { JSX } from 'solid-js';

export function RootLayout(): JSX.Element {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <AppNav />
      <Outlet />
    </div>
  );
}
