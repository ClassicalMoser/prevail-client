import {
  buildAssignUnitSupportSubmit,
  buildDoneIssuingSubmit,
  buildIssueCommandSubmit,
  buildPerformRangedAttackSubmit,
  canConfirmAssignUnitSupport,
  canConfirmIssueCommand,
  canConfirmPerformRangedAttack,
  choiceListItems,
  commitRefuseEvent,
  computeHighlights,
  defaultFacingForSide,
  emptySelection,
  handleCellClick,
  handleFacingClick,
  handCardsFromState,
  hasStagedUndo,
  isCommitChoiceType,
  issueCommandLabels,
  legalOptionsForSeat,
  lineUnitsFromStartToEnd,
  formatPlayerChoiceZodIssues,
  patchEventNumber,
  preflightPlayerChoice,
  resetStagedSelection,
  selectAssignUnitSupportCard,
  selectIssueCommand,
  selectSetupUnit,
  selectionForOptions,
  toggleRoutDiscardCard,
  undoStagedSelection,
  unitKey,
} from './selection';
import type {
  CellHighlight,
  ChoiceListItem,
  PlayHighlights,
  SeatSelection,
} from './selection';
import {
  formatCommandLabel,
  issuedCommandsFromState,
  playCardSlotsFromState,
  remainingCommandsBySide,
} from './playVisibility';
import type { IssuedCommandView, PlayCardSlotView } from './playVisibility';
import {
  cardEconomyFromState,
  formatCardEconomyMeter,
} from './cardEconomyFromState';
import type { CardEconomyView, SideCardEconomy } from './cardEconomyFromState';
import {
  combatContextFromState,
  engagementLabelAtCoordinate,
  formatCombatEngagementLine,
  formatCommitmentStatus,
  unitLabelsAtCoordinate,
} from './combatContextFromState';
import type {
  CombatContextView,
  CombatUnitLabel,
  CommitmentStatusView,
} from './combatContextFromState';
import { setupUnitsByType } from './setupUnitsByType';
import type { SetupUnitTypeGroup } from './setupUnitsByType';
import {
  ingestFoldedGameState,
  ingestSeatSnapshot,
  subscribeRouteGame,
} from './gameStateIngest';
import type {
  GameStateIngestChange,
  GameStateIngestPorts,
} from './gameStateIngest';
import { projectPlayBoardCells } from './playBoardProjection';
import type {
  PlayBoardCellView,
  PlayBoardUnitView,
} from './playBoardProjection';
import { createSeatPlayActions } from './seatPlayActions';
import type { SeatPlayActions, SeatPlayActionsDeps } from './seatPlayActions';
import { createSeatStreamSession } from './seatStreamSession';
import type {
  SeatGameSnapshot,
  SeatStreamSession,
  SeatStreamSessionDeps,
} from './seatStreamSession';
import { submitPlayerChoice } from './submitPlayerChoice';
import { seatCommitmentSideLabel } from './seatCommitmentSideLabel';
import { useSeatPlaySession } from './useSeatPlaySession';
import type { UseSeatPlaySessionResult } from './useSeatPlaySession';

export {
  buildAssignUnitSupportSubmit,
  buildDoneIssuingSubmit,
  buildIssueCommandSubmit,
  buildPerformRangedAttackSubmit,
  canConfirmAssignUnitSupport,
  canConfirmIssueCommand,
  canConfirmPerformRangedAttack,
  choiceListItems,
  commitRefuseEvent,
  computeHighlights,
  defaultFacingForSide,
  emptySelection,
  handleCellClick,
  handleFacingClick,
  handCardsFromState,
  hasStagedUndo,
  isCommitChoiceType,
  issueCommandLabels,
  legalOptionsForSeat,
  lineUnitsFromStartToEnd,
  formatPlayerChoiceZodIssues,
  patchEventNumber,
  preflightPlayerChoice,
  resetStagedSelection,
  selectAssignUnitSupportCard,
  selectIssueCommand,
  selectSetupUnit,
  selectionForOptions,
  toggleRoutDiscardCard,
  undoStagedSelection,
  unitKey,
  type CellHighlight,
  type ChoiceListItem,
  type PlayHighlights,
  type SeatSelection,
  formatCommandLabel,
  issuedCommandsFromState,
  playCardSlotsFromState,
  remainingCommandsBySide,
  type IssuedCommandView,
  type PlayCardSlotView,
  cardEconomyFromState,
  formatCardEconomyMeter,
  type CardEconomyView,
  type SideCardEconomy,
  combatContextFromState,
  engagementLabelAtCoordinate,
  formatCombatEngagementLine,
  formatCommitmentStatus,
  unitLabelsAtCoordinate,
  type CombatContextView,
  type CombatUnitLabel,
  type CommitmentStatusView,
  setupUnitsByType,
  type SetupUnitTypeGroup,
  ingestFoldedGameState,
  ingestSeatSnapshot,
  subscribeRouteGame,
  type GameStateIngestChange,
  type GameStateIngestPorts,
  type PlayBoardCellView,
  type PlayBoardUnitView,
  projectPlayBoardCells,
  createSeatPlayActions,
  type SeatPlayActions,
  type SeatPlayActionsDeps,
  createSeatStreamSession,
  type SeatGameSnapshot,
  type SeatStreamSession,
  type SeatStreamSessionDeps,
  submitPlayerChoice,
  seatCommitmentSideLabel,
  useSeatPlaySession,
  type UseSeatPlaySessionResult,
};
