import type { PlayerChoiceEvent } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from './seatSelection';

export interface CellClickResult {
  selection: SeatSelection;
  submit?: PlayerChoiceEvent;
}
