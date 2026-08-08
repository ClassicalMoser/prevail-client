import type {
  GameState,
  UnitPlacement,
  UnitWithPlacement,
} from '@classicalmoser/prevail-rules/domain';
import { getLegalUnitMoves } from '@classicalmoser/prevail-rules/domain';
import { cloneDraft } from '@application/authoring';

export function legalDestinationsForUnit(
  unit: UnitWithPlacement,
  state: GameState,
): UnitPlacement[] {
  try {
    // Plain clone — Solid store proxies can break engine equality checks.
    return [...getLegalUnitMoves(cloneDraft(unit), state)];
  } catch (error) {
    console.error(error);
    return [];
  }
}
