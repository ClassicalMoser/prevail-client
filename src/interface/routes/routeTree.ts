import { createRootRoute, createRoute } from '@tanstack/solid-router';
import {
  CommandCardEditorPage,
  CommandCardsPage,
  HomePage,
  UnitCardEditorPage,
  UnitCardsPage,
} from '@interface/pages';
import { CardBrowserRoute, CardBrowserRoutePending } from '@interface/pages/cards';
import { AdminLayout } from './AdminLayout';
import { RootLayout } from './RootLayout';

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const cardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'cards',
  component: CardBrowserRoute,
  pendingComponent: CardBrowserRoutePending,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin',
  component: AdminLayout,
});

const commandCardsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'command-cards',
  component: CommandCardsPage,
});

const commandCardEditorRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'command-cards/$cardId',
  component: CommandCardEditorPage,
});

const unitCardsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'unit-cards',
  component: UnitCardsPage,
});

const unitCardEditorRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'unit-cards/$cardId',
  component: UnitCardEditorPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  cardsRoute,
  adminRoute.addChildren([
    commandCardsRoute,
    commandCardEditorRoute,
    unitCardsRoute,
    unitCardEditorRoute,
  ]),
]);
