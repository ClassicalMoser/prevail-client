import type {
  Coordinate,
  GameState,
  PlayerSide,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import {
  getBoardSpace,
  hasSingleUnit,
} from '@classicalmoser/prevail-rules/domain';

export function unitAtCoordinate(
  state: GameState,
  coordinate: Coordinate,
  player: PlayerSide,
): UnitInstance | undefined {
  try {
    const space = getBoardSpace(state.boardState, coordinate);
    if (
      hasSingleUnit(space.unitPresence) &&
      space.unitPresence.unit.playerSide === player
    ) {
      return space.unitPresence.unit;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
