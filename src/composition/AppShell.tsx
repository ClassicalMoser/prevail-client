import { CoreProvider, ServerPortsProvider } from '@application';
import { createServerPorts } from '@infrastructure';
import { router } from '@interface/routes';
import { QueryClientProvider } from '@tanstack/solid-query';
import { RouterProvider } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { queryClient } from './queryClient';

const serverPorts = createServerPorts();

export function AppShell(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerPortsProvider value={serverPorts}>
        <CoreProvider>
          <RouterProvider router={router} />
        </CoreProvider>
      </ServerPortsProvider>
    </QueryClientProvider>
  );
}
