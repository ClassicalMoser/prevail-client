import type {
  CommandCard,
  GameState,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { getOwnedPlayerCardState } from '@classicalmoser/prevail-rules/domain';

export function handCardsFromState(
  state: GameState | undefined,
  side: PlayerSide,
): CommandCard[] {
  if (state === undefined) {
    return [];
  }
  try {
    return getOwnedPlayerCardState(state.cardState, side).inHand;
  } catch {
    return [];
  }
}
