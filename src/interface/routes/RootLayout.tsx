import { Outlet } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';

export function RootLayout(): JSX.Element {
  return <Outlet />;
}
