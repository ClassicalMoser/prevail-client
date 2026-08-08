import { useAuth } from '@application';
import { Button } from '../button';
import { Link } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

const navLinkClass =
  'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground';

export const AppNav = (): JSX.Element => {
  const auth = useAuth();

  return (
    <header class="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav class="container mx-auto flex h-14 items-center gap-6 px-4">
        <Link to="/" class="font-display text-lg font-semibold tracking-wide">
          Prevail
        </Link>
        <div class="flex flex-1 items-center gap-4">
          <Link to="/cards" class={navLinkClass}>
            Cards
          </Link>
          <Show when={!auth.isLoading() && auth.isAuthenticated()}>
            <Link to="/play" class={navLinkClass}>
              Play
            </Link>
            <Link to="/command-cards" class={navLinkClass}>
              Command Cards
            </Link>
            <Link to="/unit-cards" class={navLinkClass}>
              Unit Cards
            </Link>
            <Link to="/armies" class={navLinkClass}>
              Armies
            </Link>
          </Show>
        </div>
        <Show
          when={!auth.isLoading()}
          fallback={<span class="text-muted-foreground text-sm">…</span>}
        >
          <Show
            when={auth.isAuthenticated()}
            fallback={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={auth.login}
              >
                Log in
              </Button>
            }
          >
            <div class="flex items-center gap-3">
              <Show when={auth.authUser()?.email}>
                {(email) => (
                  <span class="text-muted-foreground hidden text-sm sm:inline">
                    {email()}
                  </span>
                )}
              </Show>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={auth.logout}
              >
                Log out
              </Button>
            </div>
          </Show>
        </Show>
      </nav>
    </header>
  );
};
