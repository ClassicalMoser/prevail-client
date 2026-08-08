import type {
  FailValidationResult,
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { BoardCellView } from '@application/gameState';
import type { Accessor } from 'solid-js';
import { createMemo } from 'solid-js';
import type { CardEconomyView } from './cardEconomyFromState';
import { cardEconomyFromState } from './cardEconomyFromState';
import type { CombatContextView } from './combatContextFromState';
import { combatContextFromState } from './combatContextFromState';
import { projectPlayBoardCells } from './playBoardProjection';
import type { PlayBoardCellView } from './playBoardProjection';
import {
  issuedCommandsFromState,
  playCardSlotsFromState,
  remainingCommandsBySide,
} from './playVisibility';
import type { IssuedCommandView, PlayCardSlotView } from './playVisibility';
import {
  canConfirmAssignUnitSupport,
  canConfirmIssueCommand,
  canConfirmPerformRangedAttack,
  choiceListItems,
  commitRefuseEvent,
  computeHighlights,
  handCardsFromState,
  hasStagedUndo,
  isCommitChoiceType,
  issueCommandLabels,
} from './selection';
import type { CellHighlight, ChoiceListItem, SeatSelection } from './selection';

export function createSeatPlayViewMemos(args: {
  legalOptions: Accessor<LegalPlayerChoiceOptions | null>;
  selection: Accessor<SeatSelection>;
  choicePending: Accessor<boolean>;
  choiceRejected: Accessor<FailValidationResult | undefined>;
  lastAttempt: Accessor<PlayerChoiceEvent | undefined>;
  side: Accessor<PlayerSide>;
  readGameState: () => GameState | undefined;
  boardCellsBase: Accessor<Readonly<Partial<Record<string, BoardCellView>>>>;
}): {
  boardCells: Accessor<Readonly<Partial<Record<string, PlayBoardCellView>>>>;
  choiceItems: Accessor<ChoiceListItem[]>;
  issueCommands: Accessor<ReturnType<typeof issueCommandLabels>>;
  canRefuseCommit: Accessor<boolean>;
  canDoneIssuing: Accessor<boolean>;
  canConfirmIssue: Accessor<boolean>;
  canConfirmPerformRanged: Accessor<boolean>;
  canConfirmAssignUnitSupport: Accessor<boolean>;
  canUndo: Accessor<boolean>;
  canRetry: Accessor<boolean>;
  handCards: Accessor<ReturnType<typeof handCardsFromState>>;
  cardHighlights: Accessor<Readonly<Partial<Record<string, CellHighlight>>>>;
  playCardSlots: Accessor<{
    you: PlayCardSlotView;
    opponent: PlayCardSlotView;
  }>;
  issuedCommands: Accessor<IssuedCommandView[]>;
  remainingCommands: Accessor<ReturnType<typeof remainingCommandsBySide>>;
  cardEconomy: Accessor<CardEconomyView>;
  combatContext: Accessor<CombatContextView | null>;
} {
  const highlights = createMemo(() =>
    computeHighlights(
      args.legalOptions(),
      args.selection(),
      args.readGameState(),
    ),
  );
  const boardCells = createMemo(() =>
    projectPlayBoardCells({
      baseCells: args.boardCellsBase(),
      highlights: highlights(),
      selection: args.selection(),
    }),
  );
  const choiceItems = createMemo(() => {
    const options = args.legalOptions();
    if (
      options !== null &&
      (options.choiceType === 'chooseCard' ||
        options.choiceType === 'chooseRoutDiscard' ||
        isCommitChoiceType(options.choiceType))
    ) {
      return [];
    }
    return choiceListItems(options, args.readGameState()?.boardState);
  });
  const cardEconomy = createMemo(() =>
    cardEconomyFromState(args.readGameState(), args.side()),
  );
  const combatContext = createMemo(() =>
    combatContextFromState(args.readGameState()),
  );
  const issueCommands = createMemo(() =>
    issueCommandLabels(args.legalOptions()),
  );
  const canRefuseCommit = createMemo(
    () =>
      commitRefuseEvent(args.legalOptions()) !== undefined &&
      !args.choicePending(),
  );
  const canDoneIssuing = createMemo(() => {
    const options = args.legalOptions();
    if (options === null || args.choicePending()) {
      return false;
    }
    if (options.choiceType === 'doneIssuingCommands') {
      return true;
    }
    return options.choiceType === 'issueCommand' && options.canDoneIssuing;
  });
  const canConfirmIssue = createMemo(
    () => canConfirmIssueCommand(args.selection()) && !args.choicePending(),
  );
  const canConfirmPerformRanged = createMemo(
    () =>
      canConfirmPerformRangedAttack(args.selection()) && !args.choicePending(),
  );
  const canConfirmAssignSupport = createMemo(
    () =>
      canConfirmAssignUnitSupport(args.selection(), args.legalOptions()) &&
      !args.choicePending(),
  );
  const canUndo = createMemo(
    () => hasStagedUndo(args.selection()) && !args.choicePending(),
  );
  const canRetry = createMemo(
    () =>
      args.lastAttempt() !== undefined &&
      !args.choicePending() &&
      (args.choiceRejected() !== undefined || args.legalOptions() !== null),
  );
  const handCards = createMemo(() =>
    handCardsFromState(args.readGameState(), args.side()),
  );
  const cardHighlights = createMemo(() => highlights().cardIds);
  const playCardSlots = createMemo(() =>
    playCardSlotsFromState(args.readGameState(), args.side()),
  );
  const issuedCommands = createMemo(() =>
    issuedCommandsFromState(args.readGameState()),
  );
  const remainingCommands = createMemo(() =>
    remainingCommandsBySide(args.readGameState()),
  );

  return {
    boardCells,
    choiceItems,
    issueCommands,
    canRefuseCommit,
    canDoneIssuing,
    canConfirmIssue,
    canConfirmPerformRanged,
    canConfirmAssignUnitSupport: canConfirmAssignSupport,
    canUndo,
    canRetry,
    handCards,
    cardHighlights,
    playCardSlots,
    issuedCommands,
    remainingCommands,
    cardEconomy,
    combatContext,
  };
}
