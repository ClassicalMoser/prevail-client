import { CoreProvider } from '@application';
import { router } from '@interface/routes';
import { RouterProvider } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';

export function AppShell(): JSX.Element {
  return (
    <CoreProvider>
      <RouterProvider router={router} />
    </CoreProvider>
  );
}
