import { AuthContext, CoreProvider, ServerPortsContext } from '@application';
import { router } from '@interface';
import { QueryClientProvider } from '@tanstack/solid-query';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';
import { RouterProvider } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { appDependencies } from './dependencies';
import { queryClient } from './queryClient';

export function AppShell(): JSX.Element {
  const { authPort, serverPorts } = appDependencies();

  return (
    <AuthContext.Provider value={authPort}>
      <QueryClientProvider client={queryClient}>
        <ServerPortsContext.Provider value={serverPorts}>
          <CoreProvider>
            <RouterProvider router={router} />
          </CoreProvider>
          <SolidQueryDevtools initialIsOpen={false} />
        </ServerPortsContext.Provider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}
