import { createRootRoute, createRoute } from '@tanstack/solid-router';
import {
  ArmiesPage,
  ArmyEditorPage,
  CardBrowserRoute,
  CardBrowserRoutePending,
  CommandCardEditorPage,
  CommandCardsPage,
  HomePage,
  NewArmyPage,
  UnitCardEditorPage,
  UnitCardsPage,
} from '@interface/pages';
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

const armiesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'armies',
  component: ArmiesPage,
});

const armyNewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'armies/$gameMode/new',
  component: NewArmyPage,
});

const armyEditorRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'armies/$gameMode/$armyId',
  component: ArmyEditorPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  cardsRoute,
  adminRoute.addChildren([
    commandCardsRoute,
    commandCardEditorRoute,
    unitCardsRoute,
    unitCardEditorRoute,
    armiesRoute,
    armyNewRoute,
    armyEditorRoute,
  ]),
]);
