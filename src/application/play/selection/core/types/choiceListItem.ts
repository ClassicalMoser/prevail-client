import type { PlayerChoiceEvent } from '@classicalmoser/prevail-rules/domain';

export interface ChoiceListItem {
  id: string;
  label: string;
  event: PlayerChoiceEvent;
}
