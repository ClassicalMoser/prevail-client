import { boardSpaceToCellView, projectBoardCells } from './boardCellView';
import type { BoardCellView, BoardUnitView } from './boardCellView';
import {
  gameOutcomeDetail,
  gameOutcomeFromState,
  gameOutcomeHeadline,
} from './gameOutcome';
import type { GameOutcome } from './gameOutcome';
import { createGameStateStore, plainGameState } from './gameStateStore';
import type { GameStateIngest, GameStateStore } from './gameStateStore';
import { createGameStateProjections } from './projections';
import type { GameStateProjections, PhaseSummary } from './projections';
import { resolveUnitArtSrc } from './unitArt';

export {
  type BoardCellView,
  type BoardUnitView,
  boardSpaceToCellView,
  projectBoardCells,
  type GameOutcome,
  gameOutcomeDetail,
  gameOutcomeFromState,
  gameOutcomeHeadline,
  type GameStateIngest,
  type GameStateStore,
  createGameStateStore,
  plainGameState,
  type GameStateProjections,
  type PhaseSummary,
  createGameStateProjections,
  resolveUnitArtSrc,
};
