import { useAuth } from '@application';
import { Button } from '@interface/components';
import { Outlet } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export function AdminLayout(): JSX.Element {
  const auth = useAuth();

  return (
    <Show
      when={!auth.isLoading()}
      fallback={
        <main class="container mx-auto p-4 py-8">
          <p class="text-muted-foreground">Checking sign-in status…</p>
        </main>
      }
    >
      <Show
        when={auth.isAuthenticated()}
        fallback={
          <main class="container mx-auto flex max-w-lg flex-col gap-4 p-4 py-16">
            <h1 class="font-display text-2xl font-semibold">Admin</h1>
            <p class="text-muted-foreground">
              Sign in to author and publish command and unit cards.
            </p>
            <div>
              <Button type="button" onClick={auth.login}>
                Log in
              </Button>
            </div>
          </main>
        }
      >
        <Outlet />
      </Show>
    </Show>
  );
}
