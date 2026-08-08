export type { AuthViewModel } from './authContext';
export { AuthContext, useAuth, useAuthPort } from './authContext';
export {
  useArmyEditor,
  useCommandCardEditor,
  useUnitCardEditor,
  isGameModeName,
  validateArmyForMode,
  validateArmyShape,
} from './authoring';
export type {
  ArmyBudgetProjection,
  ArmyDraft,
  ArmyDraftValidationResult,
  UseArmyEditorResult,
} from './authoring';
export type { Core } from './bootstrap';
export { createCore } from './bootstrap';
export { CoreProvider, useCore } from './coreContext';
export type {
  BoardCellView,
  BoardUnitView,
  GameOutcome,
  GameStateIngest,
  GameStateProjections,
  GameStateStore,
  PhaseSummary,
} from './gameState';
export {
  boardSpaceToCellView,
  createGameStateProjections,
  createGameStateStore,
  gameOutcomeDetail,
  gameOutcomeFromState,
  gameOutcomeHeadline,
  projectBoardCells,
  resolveUnitArtSrc,
} from './gameState';
export {
  allCommandCardsQueryOptions,
  allUnitCardsQueryOptions,
  armyKeys,
  commandCardKeys,
  commandCardByIdQueryOptions,
  commandCardsByIdsQueryOptions,
  currentCommandCardsQueryOptions,
  currentUnitCardsQueryOptions,
  ownedArmiesQueryOptions,
  ownedArmyByIdQueryOptions,
  unitCardByIdQueryOptions,
  unitCardKeys,
  unitCardsByIdsQueryOptions,
  useAllCommandCardsQuery,
  useAllUnitCardsQuery,
  useArchiveOwnedArmyMutation,
  useCertifyLatestCommandCardVersionsMutation,
  useCertifyLatestUnitCardVersionsMutation,
  useCommandCardByIdQuery,
  useCommandCardsByIdsQuery,
  useCreateCommandCardVersionMutation,
  useCreateEmptyCommandCardMutation,
  useCreateEmptyUnitCardMutation,
  useCreateOwnedArmyMutation,
  useCreateVsBotGameMutation,
  useCreateUnitCardVersionMutation,
  useCurrentCommandCardsQuery,
  useCurrentUnitCardsQuery,
  useDeleteEmptyCommandCardsMutation,
  useDeleteEmptyUnitCardsMutation,
  useOwnedArmiesQuery,
  useOwnedArmyByIdQuery,
  usePreviewCommandCardMutation,
  usePreviewUnitCardMutation,
  useUnitCardByIdQuery,
  useUnitCardsByIdsQuery,
  useUpdateOwnedArmyMutation,
} from './queries';
export {
  ServerPortsContext,
  useArmies,
  useCommandCards,
  useGameSeat,
  useGames,
  useServerPorts,
  useUnitCards,
} from './serverPortsContext';
export {
  computeHighlights,
  formatCardEconomyMeter,
  formatCombatEngagementLine,
  formatCommitmentStatus,
  formatCommandLabel,
  isCommitChoiceType,
  legalOptionsForSeat,
  setupUnitsByType,
  unitKey,
  useSeatPlaySession,
} from './play';
export type {
  CardEconomyView,
  CellHighlight,
  ChoiceListItem,
  CombatContextView,
  IssuedCommandView,
  PlayBoardCellView,
  PlayCardSlotView,
  PlayHighlights,
  SeatSelection,
  SetupUnitTypeGroup,
  SideCardEconomy,
  UseSeatPlaySessionResult,
} from './play';
export { RouteResponseError } from '@ports';
export { useGameStorage } from './repositories';
export { useGreetMsg, useName } from './signals';
