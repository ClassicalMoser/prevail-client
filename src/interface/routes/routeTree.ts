import { createRootRoute, createRoute } from '@tanstack/solid-router';
import { HomePage } from '@interface/pages';
import { RootLayout } from './RootLayout';

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

export const routeTree = rootRoute.addChildren([indexRoute]);
