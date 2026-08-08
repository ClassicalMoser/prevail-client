import type {
  Command,
  CommandCard,
  FailValidationResult,
  GameModeName,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { useAuth } from '@application/authContext';
import { useCore } from '@application/coreContext';
import { useGameSeat } from '@application/serverPortsContext';
import type { GameSeatConnectionStatus } from '@ports';
import type { Accessor } from 'solid-js';
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from 'solid-js';
import {
  ingestFoldedGameState,
  ingestSeatSnapshot,
  subscribeRouteGame,
} from './gameStateIngest';
import type { PlayBoardCellView } from './playBoardProjection';
import type { CardEconomyView } from './cardEconomyFromState';
import type { CombatContextView } from './combatContextFromState';
import type { IssuedCommandView, PlayCardSlotView } from './playVisibility';
import { createSeatPlayActions } from './seatPlayActions';
import type { SeatPlayActions } from './seatPlayActions';
import { createSeatPlayViewMemos } from './seatPlayViewMemos';
import { bindSeatSelectionSync } from './seatSelectionSync';
import { createSeatStreamSession } from './seatStreamSession';
import { legalOptionsForSeat, resetStagedSelection } from './selection';
import type { CellHighlight, ChoiceListItem, SeatSelection } from './selection';
import { submitPlayerChoice } from './submitPlayerChoice';

export type {
  PlayBoardCellView,
  PlayBoardUnitView,
} from './playBoardProjection';

export type UseSeatPlaySessionResult = {
  connectionStatus: Accessor<GameSeatConnectionStatus>;
  choiceRejected: Accessor<FailValidationResult | undefined>;
  choicePending: Accessor<boolean>;
  canRetry: Accessor<boolean>;
  legalOptions: Accessor<LegalPlayerChoiceOptions | null>;
  selection: Accessor<SeatSelection>;
  canUndo: Accessor<boolean>;
  choiceItems: Accessor<ChoiceListItem[]>;
  issueCommands: Accessor<{ index: number; label: string; command: Command }[]>;
  canConfirmIssue: Accessor<boolean>;
  canConfirmPerformRanged: Accessor<boolean>;
  canConfirmAssignUnitSupport: Accessor<boolean>;
  handCards: Accessor<CommandCard[]>;
  cardHighlights: Accessor<Readonly<Partial<Record<string, CellHighlight>>>>;
  playCardSlots: Accessor<{
    you: PlayCardSlotView;
    opponent: PlayCardSlotView;
  }>;
  issuedCommands: Accessor<IssuedCommandView[]>;
  remainingCommands: Accessor<Partial<Record<PlayerSide, Command[]>> | null>;
  cardEconomy: Accessor<CardEconomyView>;
  combatContext: Accessor<CombatContextView | null>;
  boardCells: Accessor<Readonly<Partial<Record<string, PlayBoardCellView>>>>;
  canRefuseCommit: Accessor<boolean>;
  canDoneIssuing: Accessor<boolean>;
} & SeatPlayActions;

/**
 * Solid wire-up for seat play: signals, memos, and session lifecycle.
 * Transport/fold → {@link createSeatStreamSession}; actions → {@link createSeatPlayActions}.
 */
export function useSeatPlaySession(
  gameId: Accessor<string>,
  side: Accessor<PlayerSide>,
): UseSeatPlaySessionResult {
  const core = useCore();
  const gameSeat = useGameSeat();
  const auth = useAuth();

  const ingestPorts = {
    setSubscribedGame: core.setSubscribedGame,
    ingest: core.ingestGameState,
  };

  const [connectionStatus, setConnectionStatus] =
    createSignal<GameSeatConnectionStatus>('connecting');
  const [choiceRejected, setChoiceRejected] = createSignal<
    FailValidationResult | undefined
  >();
  const [choicePending, setChoicePending] = createSignal(false);
  const [lastAttempt, setLastAttempt] = createSignal<
    PlayerChoiceEvent | undefined
  >();
  const [selection, setSelection] = createSignal<SeatSelection>(
    resetStagedSelection(null),
  );
  const [sendChoice, setSendChoice] = createSignal<
    ((choice: PlayerChoiceEvent) => boolean) | undefined
  >();
  const [gameMode, setGameMode] = createSignal<GameModeName>('mini');

  const legalOptions = createMemo(() =>
    legalOptionsForSeat(core.game.state(), side()),
  );

  bindSeatSelectionSync({
    legalOptions,
    selection,
    setSelection,
    readGameState: () => core.game.state(),
    setChoicePending,
    setChoiceRejected,
    setLastAttempt,
  });

  createEffect(() => {
    const id = gameId();
    const humanSide = side();
    const getAccessToken = untrack(() => auth.getAccessToken);
    const initialGameMode = untrack(() => gameMode());

    setConnectionStatus('connecting');
    setChoiceRejected(undefined);
    setChoicePending(false);
    setLastAttempt(undefined);
    setSendChoice(undefined);
    subscribeRouteGame(ingestPorts, id, initialGameMode);

    const session = createSeatStreamSession({
      gameId: id,
      side: humanSide,
      connect: (args) => gameSeat.connect(args),
      getAccessToken: () => getAccessToken(['game:play']),
      readGameState: () => core.game.state(),
      initialGameMode,
      onStatus: setConnectionStatus,
      onSnapshot: (game) => {
        setGameMode(game.gameMode);
        ingestSeatSnapshot(ingestPorts, game);
        setChoiceRejected(undefined);
      },
      onFoldedState: (change) => {
        ingestFoldedGameState(ingestPorts, change);
      },
      onRejected: setChoiceRejected,
      onUnlockPending: () => {
        setChoicePending(false);
      },
      onSendReady: (send) => {
        setSendChoice(() => send);
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- fire-and-forget connect
    session.start();
    onCleanup(() => {
      session.dispose();
      setSendChoice(undefined);
      setChoicePending(false);
    });
  });

  const submit = (choice: PlayerChoiceEvent): void => {
    submitPlayerChoice(
      {
        choicePending,
        readGameState: () => core.game.state(),
        sendChoice,
        setChoicePending,
        setLastAttempt,
        setChoiceRejected,
      },
      choice,
    );
  };

  const actions = createSeatPlayActions({
    choicePending,
    setChoicePending,
    setChoiceRejected,
    legalOptions,
    selection,
    setSelection,
    readGameState: () => core.game.state(),
    lastAttempt,
    submit,
  });

  const view = createSeatPlayViewMemos({
    legalOptions,
    selection,
    choicePending,
    choiceRejected,
    lastAttempt,
    side,
    readGameState: () => core.game.state(),
    boardCellsBase: core.game.boardCells,
  });

  return {
    connectionStatus,
    choiceRejected,
    choicePending,
    legalOptions,
    selection,
    ...view,
    ...actions,
  };
}
