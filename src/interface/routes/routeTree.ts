import { createRootRoute, createRoute } from '@tanstack/solid-router';
import {
  CommandCardEditorPage,
  CommandCardsPage,
  HomePage,
  UnitCardEditorPage,
  UnitCardsPage,
} from '@interface/pages';
import { RootLayout } from './RootLayout';

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const commandCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'command-cards',
  component: CommandCardsPage,
});

const commandCardEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'command-cards/$cardId',
  component: CommandCardEditorPage,
});

const unitCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'unit-cards',
  component: UnitCardsPage,
});

const unitCardEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'unit-cards/$cardId',
  component: UnitCardEditorPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  commandCardsRoute,
  commandCardEditorRoute,
  unitCardsRoute,
  unitCardEditorRoute,
]);
