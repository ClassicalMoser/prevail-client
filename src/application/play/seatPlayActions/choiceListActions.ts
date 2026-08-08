import type { ChoiceListItem } from '../selection';
import type { SeatPlayActionsDeps } from './types';

export function createChoiceListActions(deps: SeatPlayActionsDeps): {
  onChoiceItem: (item: ChoiceListItem) => void;
} {
  return {
    onChoiceItem: (item) => {
      deps.submit(item.event);
    },
  };
}
