import type { PlayerChoiceEvent } from '@classicalmoser/prevail-rules/domain';

export function patchEventNumber(
  event: PlayerChoiceEvent,
  eventNumber: number,
): PlayerChoiceEvent {
  return { ...event, eventNumber };
}
