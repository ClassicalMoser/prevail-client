import type {
  Coordinate,
  FailValidationResult,
  GameModeName,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import { applyEvent } from '@classicalmoser/prevail-rules/domain';
import { useAuth } from '@application/authContext';
import { useCore } from '@application/coreContext';
import type { BoardCellView } from '@application/gameState';
import { useGameSeat } from '@application/serverPortsContext';
import type { GameSeatConnectionStatus } from '@ports';
import type { Accessor } from 'solid-js';
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import {
  buildIssueCommandSubmit,
  choiceListItems,
  computeHighlights,
  emptySelection,
  handleCellClick,
  handCardsFromState,
  issueCommandLabels,
  legalOptionsForSeat,
  patchEventNumber,
  selectIssueCommand,
  selectSetupUnit,
  selectionForOptions,
  toggleRoutDiscardCard,
} from './selectionFsm';
import type { ChoiceListItem, SeatSelection } from './selectionFsm';

export type PlayBoardCellView = BoardCellView & {
  highlight?: 'legal' | 'selected';
};

export interface UseSeatPlaySessionResult {
  connectionStatus: Accessor<GameSeatConnectionStatus>;
  choiceRejected: Accessor<FailValidationResult | undefined>;
  legalOptions: Accessor<LegalPlayerChoiceOptions | null>;
  selection: Accessor<SeatSelection>;
  choiceItems: Accessor<ChoiceListItem[]>;
  issueCommands: Accessor<ReturnType<typeof issueCommandLabels>>;
  handCards: Accessor<ReturnType<typeof handCardsFromState>>;
  boardCells: Accessor<Readonly<Partial<Record<string, PlayBoardCellView>>>>;
  onCellClick: (coordinate: string) => void;
  onChoiceItem: (item: ChoiceListItem) => void;
  onSelectSetupUnit: (unit: UnitInstance) => void;
  onSelectIssueCommand: (index: number) => void;
  onConfirmIssueCommand: () => void;
  onToggleRoutCard: (cardId: string) => void;
  onChooseCardId: (cardId: string) => void;
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
  const [selection, setSelection] =
    createSignal<SeatSelection>(emptySelection());
  const [sendChoice, setSendChoice] = createSignal<
    ((choice: PlayerChoiceEvent) => void) | undefined
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

  createEffect(() => {
    optionsIdentity();
    setSelection(selectionForOptions(legalOptions()));
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
    setChoiceRejected();
    setSendChoice();

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
            case 'roundSnapshot': {
              const game = message.payload;
              setGameMode(game.gameMode);
              core.setSubscribedGame(game.id, game.gameMode);
              core.ingestGameState({
                gameId: game.id,
                gameMode: game.gameMode,
                gameState: game.gameState,
              });
              break;
            }
            case 'playerChoice':
            case 'gameEffect': {
              const current = core.game.state();
              if (current === undefined) {
                console.error('Seat WS fold: no local state yet');
                return;
              }
              try {
                const next = applyEvent(message.payload, current);
                core.ingestGameState({
                  gameId: id,
                  gameMode: gameMode(),
                  gameState: next,
                });
              } catch (error) {
                console.error('Seat WS fold failed', error);
              }
              break;
            }
            case 'choiceRejected': {
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
      setSendChoice();
    });
  });

  const submit = (choice: PlayerChoiceEvent) => {
    const state = core.game.state();
    const eventNumber =
      state?.currentRoundState.events.length ?? choice.eventNumber;
    const payload = patchEventNumber(choice, eventNumber);
    const send = sendChoice();
    if (send === undefined) {
      console.error('Seat WS: cannot submit, not connected');
      return;
    }
    setChoiceRejected();
    send(payload);
    setSelection(emptySelection());
  };

  const highlights = createMemo(() =>
    computeHighlights(legalOptions(), selection()),
  );

  const boardCells = createMemo(() => {
    const base = core.game.boardCells();
    const hl = highlights().cells;
    const merged: Partial<Record<string, PlayBoardCellView>> = {};
    for (const [coord, view] of Object.entries(base)) {
      if (view === undefined) {
        continue;
      }
      merged[coord] = { ...view, highlight: hl[coord] };
    }
    for (const [coord, highlight] of Object.entries(hl)) {
      if (merged[coord] === undefined) {
        merged[coord] = {
          coordinate: coord,
          commanders: [],
          units: [],
          highlight,
        };
      }
    }
    return merged;
  });

  const choiceItems = createMemo(() => choiceListItems(legalOptions()));
  const issueCommands = createMemo(() => issueCommandLabels(legalOptions()));
  const handCards = createMemo(() =>
    handCardsFromState(core.game.state(), side()),
  );

  return {
    connectionStatus,
    choiceRejected,
    legalOptions,
    selection,
    choiceItems,
    issueCommands,
    handCards,
    boardCells,
    onCellClick: (coordinate) => {
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
    onChoiceItem: (item) => {
      submit(item.event);
    },
    onSelectSetupUnit: (unit) => {
      setSelection(selectSetupUnit(selection(), unit));
    },
    onSelectIssueCommand: (index) => {
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
    onToggleRoutCard: (cardId) => {
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
    clearRejection: () => {
      setChoiceRejected();
    },
  };
}
