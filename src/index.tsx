import { AppShell, initializeAppDependencies } from '@composition';
/* @refresh reload */
import { render } from 'solid-js/web';
import type { JSX } from 'solid-js';
import './styles/app.css';

const root = document.querySelector('#root') as HTMLElement;

const bootScreen = (message: string): JSX.Element => (
  <div class="flex min-h-screen items-center justify-center bg-background text-foreground">
    {message}
  </div>
);

const disposeLoading = render(() => bootScreen('Loading…'), root);

try {
  await initializeAppDependencies();
  disposeLoading();
  render(() => <AppShell />, root);
} catch (error: unknown) {
  disposeLoading();
  const message =
    error instanceof Error ? error.message : 'Failed to start the app.';
  render(() => bootScreen(message), root);
}
