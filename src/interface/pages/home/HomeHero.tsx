import { useAuth } from '@application';
import { Link } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export function HomeHero(): JSX.Element {
  const auth = useAuth();

  return (
    <section class="home-hero" aria-label="Prevail">
      <div class="home-hero__field" aria-hidden="true" />
      <div class="home-hero__veil" aria-hidden="true" />
      <div class="home-hero__copy">
        <h1 class="home-hero__brand">Prevail</h1>
        <p class="home-hero__headline">Ancient Battles</p>
        <p class="home-hero__lede">
          A square-grid wargame driven by command cards — author units and
          armies, then take a seat against the bot.
        </p>
        <div class="home-hero__actions">
          <Show
            when={!auth.isLoading() && auth.isAuthenticated()}
            fallback={
              <button
                type="button"
                class="home-hero__cta home-hero__cta--primary"
                onClick={auth.login}
              >
                Log in to play
              </button>
            }
          >
            <Link to="/play" class="home-hero__cta home-hero__cta--primary">
              Play
            </Link>
          </Show>
          <Link to="/cards" class="home-hero__cta home-hero__cta--ghost">
            Browse cards
          </Link>
        </div>
      </div>
    </section>
  );
}
