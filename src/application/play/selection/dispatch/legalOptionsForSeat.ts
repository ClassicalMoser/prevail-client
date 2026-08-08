import type {
  GameState,
  LegalPlayerChoiceOptions,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { getLegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { isHumanTurn } from '../core';

/** Legal options when it is this seat's turn; otherwise null. */
export function legalOptionsForSeat(
  state: GameState | undefined,
  humanSide: PlayerSide,
): LegalPlayerChoiceOptions | null {
  if (state === undefined) {
    return null;
  }
  let options: LegalPlayerChoiceOptions | null;
  try {
    options = getLegalPlayerChoiceOptions(state);
  } catch {
    return null;
  }
  return isHumanTurn(options, humanSide) ? options : null;
}
