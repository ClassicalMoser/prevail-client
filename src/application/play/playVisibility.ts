import { getIssueCommandsPhaseState } from '@classicalmoser/prevail-rules/domain';
import type {
  Command,
  CommandCard,
  Event,
  GameState,
  IssueCommandEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { unitInstanceLabel } from '@application/gameState';

type PlayCardSlotView =
  | { kind: 'empty'; label: string }
  | { kind: 'facedown'; label: string }
  | { kind: 'card'; label: string; card: CommandCard };

interface IssuedCommandView {
  id: string;
  player: PlayerSide;
  commandLabel: string;
  unitLabels: string[];
}

function oppositeSide(side: PlayerSide): PlayerSide {
  if (side === 'white') {
    return 'black';
  }
  return 'white';
}

/**
 * Player-facing command line: type, count, and size in words.
 * Does not show the enum keys `movement`, `rangedAttack`, `units`, or `lines`.
 */
function formatCommandLabel(command: Command): string {
  const typeLabel =
    command.type === 'movement' ? 'Move' : 'Ranged attack';
  const sizeSingular = command.size === 'units' ? 'unit' : 'line';
  const sizeLabel =
    command.number === 1 ? sizeSingular : `${sizeSingular}s`;
  const label = `${typeLabel} ${command.number} ${sizeLabel}`;
  return label;
}

function slotFromOwned(
  awaitingPlay: CommandCard | null,
  inPlay: CommandCard | null,
): PlayCardSlotView {
  if (inPlay !== null) {
    const slot: PlayCardSlotView = {
      kind: 'card',
      label: 'In play',
      card: inPlay,
    };
    return slot;
  }
  if (awaitingPlay !== null) {
    const slot: PlayCardSlotView = {
      kind: 'card',
      label: 'Selected',
      card: awaitingPlay,
    };
    return slot;
  }
  const empty: PlayCardSlotView = { kind: 'empty', label: 'No card yet' };
  return empty;
}

function slotFromHidden(
  awaitingPlay: 'hidden' | null,
  inPlay: CommandCard | null,
): PlayCardSlotView {
  if (inPlay !== null) {
    const slot: PlayCardSlotView = {
      kind: 'card',
      label: 'In play',
      card: inPlay,
    };
    return slot;
  }
  if (awaitingPlay === 'hidden') {
    const slot: PlayCardSlotView = {
      kind: 'facedown',
      label: 'Selected (hidden)',
    };
    return slot;
  }
  const empty: PlayCardSlotView = { kind: 'empty', label: 'No card yet' };
  return empty;
}

/**
 * Seat-visible card slots for the human and opponent (awaiting / revealed).
 */
function playCardSlotsFromState(
  state: GameState | undefined,
  humanSide: PlayerSide,
): { you: PlayCardSlotView; opponent: PlayCardSlotView } {
  const empty = {
    you: { kind: 'empty' as const, label: 'No card yet' },
    opponent: { kind: 'empty' as const, label: 'No card yet' },
  };
  if (state === undefined) {
    return empty;
  }

  const { cardState } = state;
  const oppSide = oppositeSide(humanSide);

  if (cardState.visibility === 'authoritative') {
    const slots = {
      you: slotFromOwned(
        cardState[humanSide].awaitingPlay,
        cardState[humanSide].inPlay,
      ),
      opponent: slotFromOwned(
        cardState[oppSide].awaitingPlay,
        cardState[oppSide].inPlay,
      ),
    };
    return slots;
  }

  if (cardState.visibility === 'whiteSeen') {
    const slots = {
      you:
        humanSide === 'white'
          ? slotFromOwned(cardState.white.awaitingPlay, cardState.white.inPlay)
          : slotFromHidden(
              cardState.black.awaitingPlay,
              cardState.black.inPlay,
            ),
      opponent:
        humanSide === 'white'
          ? slotFromHidden(cardState.black.awaitingPlay, cardState.black.inPlay)
          : slotFromOwned(cardState.white.awaitingPlay, cardState.white.inPlay),
    };
    return slots;
  }

  const slots = {
    you:
      humanSide === 'black'
        ? slotFromOwned(cardState.black.awaitingPlay, cardState.black.inPlay)
        : slotFromHidden(cardState.white.awaitingPlay, cardState.white.inPlay),
    opponent:
      humanSide === 'black'
        ? slotFromHidden(cardState.white.awaitingPlay, cardState.white.inPlay)
        : slotFromOwned(cardState.black.awaitingPlay, cardState.black.inPlay),
  };
  return slots;
}

function isIssueCommandEvent(event: Event): event is IssueCommandEvent {
  return (
    event.eventType === 'playerChoice' && event.choiceType === 'issueCommand'
  );
}

/** Issued commands this round, derived from folded round events. */
function issuedCommandsFromState(
  state: GameState | undefined,
): IssuedCommandView[] {
  if (state === undefined) {
    const none: IssuedCommandView[] = [];
    return none;
  }
  const issued = state.currentRoundState.events
    .filter(isIssueCommandEvent)
    .map((event, index) => {
      const view: IssuedCommandView = {
        id: `issue-${event.eventNumber}-${index}`,
        player: event.player,
        commandLabel: formatCommandLabel(event.command),
        unitLabels: event.units.map((unit) => unitInstanceLabel(unit)),
      };
      return view;
    });
  return issued;
}

/**
 * Remaining commands during issueCommands.
 * Undefined when no state is loaded or the current phase is not issueCommands.
 */
function remainingCommandsBySide(
  state: GameState | undefined,
): Partial<Record<PlayerSide, Command[]>> | undefined {
  if (state === undefined) {
    return;
  }
  try {
    const phase = getIssueCommandsPhaseState(state);
    const first = state.currentInitiative;
    const second = oppositeSide(first);
    const remaining: Partial<Record<PlayerSide, Command[]>> = {
      [first]: [...phase.remainingCommandsFirstPlayer],
      [second]: [...phase.remainingCommandsSecondPlayer],
    };
    return remaining;
  } catch {
    // getIssueCommandsPhaseState throws outside the issueCommands phase.
  }
}

export {
  type PlayCardSlotView,
  type IssuedCommandView,
  oppositeSide,
  formatCommandLabel,
  playCardSlotsFromState,
  issuedCommandsFromState,
  remainingCommandsBySide,
};
