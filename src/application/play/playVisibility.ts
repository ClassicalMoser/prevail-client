import type {
  Command,
  CommandCard,
  Event,
  GameState,
  IssueCommandEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { getIssueCommandsPhaseState } from '@classicalmoser/prevail-rules/domain';

export type PlayCardSlotView =
  | { kind: 'empty'; label: string }
  | { kind: 'facedown'; label: string }
  | { kind: 'card'; label: string; card: CommandCard };

export interface IssuedCommandView {
  id: string;
  player: PlayerSide;
  commandLabel: string;
  unitLabels: string[];
}

export function oppositeSide(side: PlayerSide): PlayerSide {
  return side === 'white' ? 'black' : 'white';
}

export function formatCommandLabel(command: Command): string {
  return `${command.type} ×${command.number} (${command.size})`;
}

function slotFromOwned(
  awaitingPlay: CommandCard | null,
  inPlay: CommandCard | null,
): PlayCardSlotView {
  if (inPlay !== null) {
    return { kind: 'card', label: 'In play', card: inPlay };
  }
  if (awaitingPlay !== null) {
    return { kind: 'card', label: 'Selected', card: awaitingPlay };
  }
  return { kind: 'empty', label: 'No card yet' };
}

function slotFromHidden(
  awaitingPlay: 'hidden' | null,
  inPlay: CommandCard | null,
): PlayCardSlotView {
  if (inPlay !== null) {
    return { kind: 'card', label: 'In play', card: inPlay };
  }
  if (awaitingPlay === 'hidden') {
    return { kind: 'facedown', label: 'Selected (hidden)' };
  }
  return { kind: 'empty', label: 'No card yet' };
}

/**
 * Seat-visible card slots for the human and opponent (awaiting / revealed).
 */
export function playCardSlotsFromState(
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
    return {
      you: slotFromOwned(
        cardState[humanSide].awaitingPlay,
        cardState[humanSide].inPlay,
      ),
      opponent: slotFromOwned(
        cardState[oppSide].awaitingPlay,
        cardState[oppSide].inPlay,
      ),
    };
  }

  if (cardState.visibility === 'whiteSeen') {
    return {
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
  }

  return {
    you:
      humanSide === 'black'
        ? slotFromOwned(cardState.black.awaitingPlay, cardState.black.inPlay)
        : slotFromHidden(cardState.white.awaitingPlay, cardState.white.inPlay),
    opponent:
      humanSide === 'black'
        ? slotFromHidden(cardState.white.awaitingPlay, cardState.white.inPlay)
        : slotFromOwned(cardState.black.awaitingPlay, cardState.black.inPlay),
  };
}

function isIssueCommandEvent(event: Event): event is IssueCommandEvent {
  return (
    event.eventType === 'playerChoice' && event.choiceType === 'issueCommand'
  );
}

/** Issued commands this round, derived from folded round events. */
export function issuedCommandsFromState(
  state: GameState | undefined,
): IssuedCommandView[] {
  if (state === undefined) {
    return [];
  }
  return state.currentRoundState.events
    .filter(isIssueCommandEvent)
    .map((event, index) => ({
      id: `issue-${event.eventNumber}-${index}`,
      player: event.player,
      commandLabel: formatCommandLabel(event.command),
      unitLabels: event.units.map(
        (unit) =>
          `${unit.unitType.name} (${unit.playerSide} #${unit.instanceNumber})`,
      ),
    }));
}

/** Remaining commands during issueCommands; null outside that phase. */
export function remainingCommandsBySide(
  state: GameState | undefined,
): Partial<Record<PlayerSide, Command[]>> | null {
  if (state === undefined) {
    return null;
  }
  try {
    const phase = getIssueCommandsPhaseState(state);
    const first = state.currentInitiative;
    const second = oppositeSide(first);
    return {
      [first]: [...phase.remainingCommandsFirstPlayer],
      [second]: [...phase.remainingCommandsSecondPlayer],
    };
  } catch {
    return null;
  }
}
