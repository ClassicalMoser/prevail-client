export type { BoardCellView, BoardUnitView } from './boardCellView';
export { boardSpaceToCellView, projectBoardCells } from './boardCellView';
export type { GameOutcome } from './gameOutcome';
export {
  gameOutcomeDetail,
  gameOutcomeFromState,
  gameOutcomeHeadline,
} from './gameOutcome';
export type { GameStateIngest, GameStateStore } from './gameStateStore';
export { createGameStateStore, plainGameState } from './gameStateStore';
export type { GameStateProjections, PhaseSummary } from './projections';
export { createGameStateProjections } from './projections';
export { resolveUnitArtSrc } from './unitArt';
