import { AuthProvider, CoreProvider, ServerPortsProvider } from '@application';
import { createAuth0Port, createServerPorts } from '@infrastructure';
import { router } from '@interface/routes';
import { QueryClientProvider } from '@tanstack/solid-query';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';
import { RouterProvider } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { createMemo, createResource, Show } from 'solid-js';
import { queryClient } from './queryClient';

export function AppShell(): JSX.Element {
  const [authPort] = createResource(createAuth0Port);

  const boot = createMemo(() => {
    const port = authPort();
    if (!port) {
      return null;
    }

    return {
      port,
      serverPorts: createServerPorts((permissions) =>
        port.getAccessToken(permissions),
      ),
    };
  });

  return (
    <Show
      when={boot()}
      fallback={
        <div class="flex min-h-screen items-center justify-center bg-background text-foreground">
          Loading…
        </div>
      }
    >
      {(ready) => (
        <AuthProvider value={ready().port}>
          <QueryClientProvider client={queryClient}>
            <ServerPortsProvider value={ready().serverPorts}>
              <CoreProvider>
                <RouterProvider router={router} />
              </CoreProvider>
              <SolidQueryDevtools initialIsOpen={false} />
            </ServerPortsProvider>
          </QueryClientProvider>
        </AuthProvider>
      )}
    </Show>
  );
}
