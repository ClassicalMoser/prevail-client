import type {
  Coordinate,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  UnitWithPlacement,
} from '@classicalmoser/prevail-rules/domain';
import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import { cloneDraft } from '@application/authoring';

export function buildSetupSubmit(
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>,
  placements: UnitWithPlacement[],
  commanderCoordinate: Coordinate,
): PlayerChoiceEvent {
  // Strip Solid store proxies — Zod on the seat wire rejects non-plain graphs.
  return cloneDraft({
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'setupUnits' as const,
    eventNumber: options.expectedEventNumber,
    player: options.setupUnits.player,
    unitPlacements: placements,
    commanderCoordinate,
  });
}
