import type {
  Coordinate,
  FailValidationResult,
  GameModeName,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
  UnitFacing,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import { applyEvent } from '@classicalmoser/prevail-rules/domain';
import { useAuth } from '@application/authContext';
import { useCore } from '@application/coreContext';
import type { BoardCellView } from '@application/gameState';
import { resolveUnitArtSrc } from '@application/gameState';
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
  issuedCommandsFromState,
  playCardSlotsFromState,
  remainingCommandsBySide,
} from './playVisibility';
import type { IssuedCommandView, PlayCardSlotView } from './playVisibility';
import {
  buildAssignUnitSupportSubmit,
  buildIssueCommandSubmit,
  buildPerformRangedAttackSubmit,
  canConfirmAssignUnitSupport,
  canConfirmIssueCommand,
  canConfirmPerformRangedAttack,
  choiceListItems,
  computeHighlights,
  handleCellClick,
  handleFacingClick,
  handCardsFromState,
  hasStagedUndo,
  issueCommandLabels,
  legalOptionsForSeat,
  patchEventNumber,
  preflightPlayerChoice,
  resetStagedSelection,
  selectAssignUnitSupportCard,
  selectIssueCommand,
  selectSetupUnit,
  toggleRoutDiscardCard,
  undoStagedSelection,
} from './selectionFsm';
import type {
  ChoiceListItem,
  CellHighlight,
  SeatSelection,
} from './selectionFsm';

export type PlayBoardUnitView = BoardCellView['units'][number] & {
  pending?: boolean;
};

export type PlayBoardCellView = Omit<BoardCellView, 'units'> & {
  units: PlayBoardUnitView[];
  highlight?: 'legal' | 'selected';
  facingPicker?: boolean;
  enabledFacings?: readonly UnitFacing[];
};

export interface UseSeatPlaySessionResult {
  connectionStatus: Accessor<GameSeatConnectionStatus>;
  choiceRejected: Accessor<FailValidationResult | undefined>;
  choicePending: Accessor<boolean>;
  canRetry: Accessor<boolean>;
  legalOptions: Accessor<LegalPlayerChoiceOptions | null>;
  selection: Accessor<SeatSelection>;
  canUndo: Accessor<boolean>;
  choiceItems: Accessor<ChoiceListItem[]>;
  issueCommands: Accessor<ReturnType<typeof issueCommandLabels>>;
  canConfirmIssue: Accessor<boolean>;
  canConfirmPerformRanged: Accessor<boolean>;
  canConfirmAssignUnitSupport: Accessor<boolean>;
  handCards: Accessor<ReturnType<typeof handCardsFromState>>;
  cardHighlights: Accessor<Readonly<Partial<Record<string, CellHighlight>>>>;
  playCardSlots: Accessor<{
    you: PlayCardSlotView;
    opponent: PlayCardSlotView;
  }>;
  issuedCommands: Accessor<IssuedCommandView[]>;
  remainingCommands: Accessor<ReturnType<typeof remainingCommandsBySide>>;
  boardCells: Accessor<Readonly<Partial<Record<string, PlayBoardCellView>>>>;
  onCellClick: (coordinate: string) => void;
  onFacingClick: (coordinate: string, facing: UnitFacing) => void;
  onChoiceItem: (item: ChoiceListItem) => void;
  onSelectSetupUnit: (unit: UnitInstance) => void;
  onSelectIssueCommand: (index: number) => void;
  onConfirmIssueCommand: () => void;
  onConfirmPerformRangedAttack: () => void;
  onConfirmAssignUnitSupport: () => void;
  onSelectAssignUnitSupportCard: (cardId: string) => void;
  onToggleRoutCard: (cardId: string) => void;
  onChooseCardId: (cardId: string) => void;
  onUndo: () => void;
  onResetSelection: () => void;
  onRetryLastChoice: () => void;
  clearRejection: () => void;
}

/**
 * Connects the seat WebSocket, folds envelopes into Core's GameStateStore,
 * and owns legal-option selection / submit for the human seat.
 */
export function useSeatPlaySession(
  gameId: Accessor<string>,
  side: Accessor<PlayerSide>,
): UseSeatPlaySessionResult {
  const core = useCore();
  const gameSeat = useGameSeat();
  const auth = useAuth();

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

  const optionsIdentity = createMemo(() => {
    const options = legalOptions();
    if (options === null) {
      return 'none';
    }
    return `${options.choiceType}:${options.expectedEventNumber}`;
  });

  // Only reset the draft when the expected choice identity changes.
  // Untrack state reads so folds do not wipe setup placements mid-draft.
  createEffect((prevIdentity?: string) => {
    const identity = optionsIdentity();
    if (prevIdentity === identity) {
      return identity;
    }
    untrack(() => {
      setChoicePending(false);
      setChoiceRejected(undefined);
      setLastAttempt(undefined);
      setSelection(resetStagedSelection(legalOptions(), core.game.state()));
    });
    return identity;
  });

  // Realign a drifted draft when options say move/ranged/issue/setup but the
  // Selection kind no longer matches (clicks would otherwise no-op while
  // Highlights still render from options).
  createEffect(() => {
    const options = legalOptions();
    const sel = selection();
    if (options === null) {
      return;
    }
    const aligned =
      (options.choiceType === 'moveUnit' && sel.kind === 'moveUnit') ||
      (options.choiceType === 'performRangedAttack' &&
        sel.kind === 'performRangedAttack') ||
      (options.choiceType === 'issueCommand' && sel.kind === 'issueCommand') ||
      (options.choiceType === 'setupUnits' && sel.kind === 'setup') ||
      (options.choiceType === 'chooseRoutDiscard' &&
        sel.kind === 'routDiscard') ||
      (options.choiceType === 'assignUnitSupport' &&
        sel.kind === 'assignUnitSupport');
    const needsDraft =
      options.choiceType === 'moveUnit' ||
      options.choiceType === 'performRangedAttack' ||
      options.choiceType === 'issueCommand' ||
      options.choiceType === 'setupUnits' ||
      options.choiceType === 'chooseRoutDiscard' ||
      options.choiceType === 'assignUnitSupport';
    if (needsDraft && !aligned) {
      setSelection(resetStagedSelection(options, core.game.state()));
    }
  });

  createEffect(() => {
    const id = gameId();
    const humanSide = side();
    const getAccessToken = auth.getAccessToken;
    let cancelled = false;
    let connection: Awaited<ReturnType<typeof gameSeat.connect>> | undefined;
    let unsubStatus = (): void => {
      /* No-op until connected. */
    };
    let unsubMessages = (): void => {
      /* No-op until connected. */
    };

    setConnectionStatus('connecting');
    setChoiceRejected(undefined);
    setChoicePending(false);
    setLastAttempt(undefined);
    setSendChoice(undefined);

    // Non-reactive mirrors for the WS message callback (not a tracked scope).
    let activeGameMode: GameModeName = gameMode();
    const readGameState = core.game.state;
    const ingestGameState = core.ingestGameState;
    const setSubscribedGame = core.setSubscribedGame;

    const connectSeat = async (): Promise<void> => {
      try {
        const connected = await gameSeat.connect({
          gameId: id,
          side: humanSide,
          getAccessToken: () => getAccessToken(['game:play']),
        });
        if (cancelled) {
          connected.close();
          return;
        }
        connection = connected;
        setSendChoice(() => connected.sendChoice);
        unsubStatus = connected.subscribeStatus((status) => {
          setConnectionStatus(status);
        });
        unsubMessages = connected.subscribe((message) => {
          switch (message.type) {
            case 'gameSnapshot': {
              const game = message.payload;
              activeGameMode = game.gameMode;
              setGameMode(game.gameMode);
              setSubscribedGame(game.id, game.gameMode);
              ingestGameState({
                gameId: game.id,
                gameMode: game.gameMode,
                gameState: game.gameState,
              });
              // Snapshot is authoritative reconcile — clear stale fold errors.
              setChoicePending(false);
              setChoiceRejected(undefined);
              break;
            }
            case 'playerChoice':
            case 'gameEffect': {
              const current = readGameState();
              if (current === undefined) {
                console.error('Seat WS fold: no local state yet');
                connection?.requestGameSnapshot();
                return;
              }
              try {
                const next = applyEvent(message.payload, current);
                ingestGameState({
                  gameId: id,
                  gameMode: activeGameMode,
                  gameState: next,
                });
              } catch (error) {
                console.error('Seat WS fold failed', error, message.payload);
                setChoicePending(false);
                // Visibility-limited applies (e.g. opponent resolveRally) cannot
                // fold onto seat state — resync instead of cascading rejects.
                const requested = connection?.requestGameSnapshot() ?? false;
                if (!requested) {
                  setChoiceRejected({
                    errorReason:
                      'Failed to apply server event locally. Your draft was kept — undo or retry, or refresh if the board looks wrong.',
                    result: false,
                  });
                }
              }
              break;
            }
            case 'choiceRejected': {
              setChoicePending(false);
              setChoiceRejected(message.payload);
              break;
            }
            default: {
              break;
            }
          }
        });
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setConnectionStatus('error');
        }
      }
    };

    // Seat connect is intentionally fire-and-forget; cleanup closes the socket.
    connectSeat();

    onCleanup(() => {
      cancelled = true;
      unsubStatus();
      unsubMessages();
      connection?.close();
      setSendChoice(undefined);
      setChoicePending(false);
    });
  });

  const submit = (choice: PlayerChoiceEvent) => {
    if (choicePending()) {
      return;
    }
    const state = core.game.state();
    const eventNumber =
      state?.currentRoundState.events.length ?? choice.eventNumber;
    const payload = patchEventNumber(choice, eventNumber);
    const preflight = preflightPlayerChoice(payload);
    if (!preflight.ok) {
      console.error('Seat WS: local playerChoice schema failed', preflight);
      setChoicePending(false);
      setLastAttempt(payload);
      setChoiceRejected({
        errorReason: preflight.errorReason,
        result: false,
      });
      return;
    }
    const send = sendChoice();
    if (send === undefined) {
      console.error('Seat WS: send while not connected');
      setLastAttempt(preflight.choice);
      setChoiceRejected({
        errorReason: 'Not connected — choice was not sent. Draft kept.',
        result: false,
      });
      return;
    }
    // Keep staged selection until accept (options advance) or reject.
    setLastAttempt(preflight.choice);
    setChoiceRejected(undefined);
    setChoicePending(true);
    const sent = send(preflight.choice);
    if (!sent) {
      setChoicePending(false);
      setChoiceRejected({
        errorReason: 'Socket not open — choice was not sent. Draft kept.',
        result: false,
      });
    }
  };

  const highlights = createMemo(() =>
    computeHighlights(legalOptions(), selection(), core.game.state()),
  );

  const boardCells = createMemo(() => {
    const base = core.game.boardCells();
    const hl = highlights();
    const sel = selection();
    const merged: Partial<Record<string, PlayBoardCellView>> = {};
    for (const [coord, view] of Object.entries(base)) {
      if (view === undefined) {
        continue;
      }
      merged[coord] = {
        ...view,
        highlight: hl.cells[coord],
        facingPicker: hl.facingPickerCells.has(coord),
        enabledFacings: hl.facingPickerFacings[coord],
      };
    }
    for (const [coord, highlight] of Object.entries(hl.cells)) {
      if (merged[coord] === undefined) {
        merged[coord] = {
          coordinate: coord,
          commanders: [],
          units: [],
          highlight,
          facingPicker: hl.facingPickerCells.has(coord),
          enabledFacings: hl.facingPickerFacings[coord],
        };
      }
    }
    if (sel.kind === 'setup') {
      for (const placement of sel.placements) {
        const coord = placement.placement.coordinate;
        const existing = merged[coord];
        const pendingUnit = {
          label: `${placement.unit.unitType.name} (${placement.unit.playerSide} #${placement.unit.instanceNumber})`,
          facing: placement.placement.facing,
          imageSrc: resolveUnitArtSrc(placement.unit.unitType.name),
          playerSide: placement.unit.playerSide,
          pending: true as const,
        };
        if (existing === undefined) {
          merged[coord] = {
            coordinate: coord,
            commanders: [],
            units: [pendingUnit],
            highlight: hl.cells[coord] ?? 'selected',
            facingPicker: false,
          };
        } else {
          merged[coord] = {
            ...existing,
            highlight: hl.cells[coord] ?? 'selected',
            facingPicker: false,
            units: [
              ...existing.units.filter((unit) => unit.pending !== true),
              pendingUnit,
            ],
          };
        }
      }
    }
    return merged;
  });

  const choiceItems = createMemo(() => {
    const options = legalOptions();
    // Hand strip is the primary chooseCard / routDiscard UI.
    if (
      options !== null &&
      (options.choiceType === 'chooseCard' ||
        options.choiceType === 'chooseRoutDiscard')
    ) {
      return [];
    }
    return choiceListItems(options);
  });
  const issueCommands = createMemo(() => issueCommandLabels(legalOptions()));
  const canConfirmIssue = createMemo(
    () => canConfirmIssueCommand(selection()) && !choicePending(),
  );
  const canConfirmPerformRanged = createMemo(
    () => canConfirmPerformRangedAttack(selection()) && !choicePending(),
  );
  const canConfirmAssignSupport = createMemo(
    () => canConfirmAssignUnitSupport(selection()) && !choicePending(),
  );
  const canUndo = createMemo(
    () => hasStagedUndo(selection()) && !choicePending(),
  );
  const canRetry = createMemo(
    () =>
      lastAttempt() !== undefined &&
      !choicePending() &&
      (choiceRejected() !== undefined || legalOptions() !== null),
  );
  const handCards = createMemo(() =>
    handCardsFromState(core.game.state(), side()),
  );
  const cardHighlights = createMemo(() => highlights().cardIds);
  const playCardSlots = createMemo(() =>
    playCardSlotsFromState(core.game.state(), side()),
  );
  const issuedCommands = createMemo(() =>
    issuedCommandsFromState(core.game.state()),
  );
  const remainingCommands = createMemo(() =>
    remainingCommandsBySide(core.game.state()),
  );

  return {
    connectionStatus,
    choiceRejected,
    choicePending,
    canRetry,
    legalOptions,
    selection,
    canUndo,
    choiceItems,
    issueCommands,
    canConfirmIssue,
    canConfirmPerformRanged,
    canConfirmAssignUnitSupport: canConfirmAssignSupport,
    handCards,
    cardHighlights,
    playCardSlots,
    issuedCommands,
    remainingCommands,
    boardCells,
    onCellClick: (coordinate) => {
      // Drafting stays interactive even if a prior submit left pending stuck;
      // Submit itself still no-ops while pending.
      if (choicePending()) {
        setChoicePending(false);
      }
      const state = core.game.state();
      if (state === undefined) {
        return;
      }
      const result = handleCellClick({
        coordinate: coordinate as Coordinate,
        options: legalOptions(),
        selection: selection(),
        state,
      });
      setSelection(result.selection);
      if (result.submit !== undefined) {
        submit(result.submit);
      }
    },
    onFacingClick: (coordinate, facing) => {
      if (choicePending()) {
        setChoicePending(false);
      }
      const result = handleFacingClick({
        coordinate: coordinate as Coordinate,
        facing,
        options: legalOptions(),
        selection: selection(),
      });
      setSelection(result.selection);
      if (result.submit !== undefined) {
        submit(result.submit);
      }
    },
    onChoiceItem: (item) => {
      submit(item.event);
    },
    onSelectSetupUnit: (unit) => {
      if (choicePending()) {
        setChoicePending(false);
      }
      setSelection(selectSetupUnit(selection(), unit));
    },
    onSelectIssueCommand: (index) => {
      if (choicePending()) {
        setChoicePending(false);
      }
      const options = legalOptions();
      const state = core.game.state();
      if (options === null || state === undefined) {
        return;
      }
      const entry = issueCommandLabels(options)[index];
      if (entry === undefined) {
        return;
      }
      setSelection(selectIssueCommand(options, entry.command, state));
    },
    onConfirmIssueCommand: () => {
      const options = legalOptions();
      if (options === null) {
        return;
      }
      const event = buildIssueCommandSubmit(options, selection());
      if (event !== undefined) {
        submit(event);
      }
    },
    onConfirmPerformRangedAttack: () => {
      const options = legalOptions();
      if (options === null) {
        return;
      }
      const event = buildPerformRangedAttackSubmit(options, selection());
      if (event !== undefined) {
        submit(event);
      }
    },
    onConfirmAssignUnitSupport: () => {
      const options = legalOptions();
      if (options === null) {
        return;
      }
      const event = buildAssignUnitSupportSubmit(options, selection());
      if (event !== undefined) {
        submit(event);
      }
    },
    onSelectAssignUnitSupportCard: (cardId) => {
      if (choicePending()) {
        setChoicePending(false);
      }
      const options = legalOptions();
      if (options === null) {
        return;
      }
      setSelection(selectAssignUnitSupportCard(options, selection(), cardId));
    },
    onToggleRoutCard: (cardId) => {
      if (choicePending()) {
        setChoicePending(false);
      }
      const options = legalOptions();
      if (options === null) {
        return;
      }
      const result = toggleRoutDiscardCard(options, selection(), cardId);
      setSelection(result.selection);
      if (result.submit !== undefined) {
        submit(result.submit);
      }
    },
    onChooseCardId: (cardId) => {
      const item = choiceListItems(legalOptions()).find((c) => c.id === cardId);
      if (item !== undefined) {
        submit(item.event);
      }
    },
    onUndo: () => {
      // Unlock even if a failed submit left pending stuck.
      setChoicePending(false);
      setSelection(
        undoStagedSelection(selection(), legalOptions(), core.game.state()),
      );
    },
    onResetSelection: () => {
      // Unlock even if a failed submit left pending stuck.
      setChoicePending(false);
      setChoiceRejected(undefined);
      // Keep lastAttempt so Retry remains available after clearing the draft.
      setSelection(resetStagedSelection(legalOptions(), core.game.state()));
    },
    onRetryLastChoice: () => {
      const attempt = lastAttempt();
      // Force-unlock so a stuck pending cannot block reattempt.
      setChoicePending(false);
      setChoiceRejected(undefined);
      if (attempt === undefined) {
        return;
      }
      submit(attempt);
    },
    clearRejection: () => {
      setChoicePending(false);
      setChoiceRejected(undefined);
    },
  };
}
