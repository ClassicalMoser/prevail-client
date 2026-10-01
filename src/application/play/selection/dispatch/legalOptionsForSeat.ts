import { getLegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type {
  GameState,
  LegalPlayerChoiceOptions,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { isHumanTurn } from '../core';

/**
 * Read the engine's legal choice and drop its null.
 * A throw is the same as "no choice" for the seat: the phase helper rejects
 * states that are not in a choosable phase.
 */
function legalOptionsFromEngine(
  state: GameState,
): LegalPlayerChoiceOptions | undefined {
  try {
    const options = getLegalPlayerChoiceOptions(state);
    // getLegalPlayerChoiceOptions returns null when the phase offers no choice.
    if (options === null) {
      return undefined;
    }
    return options;
  } catch {
    return undefined;
  }
}

/**
 * Legal options when it is this seat's turn.
 * Undefined means there is nothing for this seat to choose. Callers get one
 * absence value. The rules engine's null does not pass this function.
 */
function legalOptionsForSeat(
  state: GameState | undefined,
  humanSide: PlayerSide,
): LegalPlayerChoiceOptions | undefined {
  // No snapshot yet, so there is no choice to offer.
  if (state === undefined) {
    return undefined;
  }
  const engineOptions = legalOptionsFromEngine(state);
  // No engine choice, or the choice belongs to the other seat.
  if (engineOptions === undefined || !isHumanTurn(engineOptions, humanSide)) {
    return undefined;
  }
  return engineOptions;
}

export { legalOptionsForSeat };
