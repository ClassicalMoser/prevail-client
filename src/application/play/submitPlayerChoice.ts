import type {
  FailValidationResult,
  GameState,
  PlayerChoiceEvent,
} from '@classicalmoser/prevail-rules/domain';
import { patchEventNumber, preflightPlayerChoice } from './selection';

export interface SubmitPlayerChoiceDeps {
  choicePending: () => boolean;
  readGameState: () => GameState | undefined;
  sendChoice: () => ((choice: PlayerChoiceEvent) => boolean) | undefined;
  setChoicePending: (pending: boolean) => void;
  setLastAttempt: (choice: PlayerChoiceEvent | undefined) => void;
  setChoiceRejected: (rejection: FailValidationResult | undefined) => void;
}

/**
 * Prefight + send a player choice. Keeps draft until accept/reject;
 * unlocks pending when the socket cannot send.
 */
export function submitPlayerChoice(
  deps: SubmitPlayerChoiceDeps,
  choice: PlayerChoiceEvent,
): void {
  if (deps.choicePending()) {
    return;
  }
  const state = deps.readGameState();
  const eventNumber =
    state?.currentRoundState.events.length ?? choice.eventNumber;
  const payload = patchEventNumber(choice, eventNumber);
  const preflight = preflightPlayerChoice(payload);
  if (!preflight.ok) {
    console.error('Seat WS: local playerChoice schema failed', preflight);
    deps.setChoicePending(false);
    deps.setLastAttempt(payload);
    deps.setChoiceRejected({
      errorReason: preflight.errorReason,
      result: false,
    });
    return;
  }
  const send = deps.sendChoice();
  if (send === undefined) {
    console.error('Seat WS: send while not connected');
    deps.setLastAttempt(preflight.choice);
    deps.setChoiceRejected({
      errorReason: 'Not connected — choice was not sent. Draft kept.',
      result: false,
    });
    return;
  }
  deps.setLastAttempt(preflight.choice);
  deps.setChoiceRejected(undefined);
  deps.setChoicePending(true);
  const sent = send(preflight.choice);
  if (!sent) {
    deps.setChoicePending(false);
    deps.setChoiceRejected({
      errorReason: 'Socket not open — choice was not sent. Draft kept.',
      result: false,
    });
  }
}
