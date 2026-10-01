import {
  defaultFacingForSide,
  emptySelection,
  formatPlayerChoiceZodIssues,
  lineUnitsFromStartToEnd,
  patchEventNumber,
  preflightPlayerChoice,
  unitKey,
} from './core';
import type {
  CellClickResult,
  CellHighlight,
  ChoiceListItem,
  PlayHighlights,
  SeatSelection,
} from './core';
import {
  choiceListItems,
  computeHighlights,
  handleCellClick,
  handleFacingClick,
  hasStagedUndo,
  legalOptionsForSeat,
  resetStagedSelection,
  selectionForOptions,
  undoStagedSelection,
} from './dispatch';
import { handCardsFromState } from './handCardsFromState';
import {
  buildDoneIssuingSubmit,
  buildIssueCommandSubmit,
  canConfirmIssueCommand,
  issueCommandLabels,
  selectIssueCommand,
} from './phases/issueCommand';
import {
  buildPerformRangedAttackSubmit,
  canConfirmPerformRangedAttack,
} from './phases/ranged';
import { toggleRoutDiscardCard } from './phases/rout';
import { selectSetupUnit } from './phases/setup';
import {
  buildAssignUnitSupportSubmit,
  canConfirmAssignUnitSupport,
  selectAssignUnitSupportCard,
} from './phases/support';
import { commitRefuseEvent, isCommitChoiceType } from './phases/commit';

export {
  defaultFacingForSide,
  emptySelection,
  formatPlayerChoiceZodIssues,
  lineUnitsFromStartToEnd,
  patchEventNumber,
  preflightPlayerChoice,
  unitKey,
  type CellClickResult,
  type CellHighlight,
  type ChoiceListItem,
  type PlayHighlights,
  type SeatSelection,
  choiceListItems,
  computeHighlights,
  handleCellClick,
  handleFacingClick,
  hasStagedUndo,
  legalOptionsForSeat,
  resetStagedSelection,
  selectionForOptions,
  undoStagedSelection,
  handCardsFromState,
  buildDoneIssuingSubmit,
  buildIssueCommandSubmit,
  canConfirmIssueCommand,
  issueCommandLabels,
  selectIssueCommand,
  buildPerformRangedAttackSubmit,
  canConfirmPerformRangedAttack,
  toggleRoutDiscardCard,
  selectSetupUnit,
  buildAssignUnitSupportSubmit,
  canConfirmAssignUnitSupport,
  selectAssignUnitSupportCard,
  commitRefuseEvent,
  isCommitChoiceType,
};
