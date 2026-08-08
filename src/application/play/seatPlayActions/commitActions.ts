import { choiceListItems, commitRefuseEvent } from '../selection';
import type { SeatPlayActionsDeps } from './types';

export function createCommitActions(deps: SeatPlayActionsDeps): {
  onRefuseCommit: () => void;
  onChooseCardId: (cardId: string) => void;
} {
  return {
    onRefuseCommit: () => {
      const event = commitRefuseEvent(deps.legalOptions());
      if (event !== undefined) {
        deps.submit(event);
      }
    },
    onChooseCardId: (cardId) => {
      const item = choiceListItems(deps.legalOptions()).find(
        (c) => c.id === cardId,
      );
      if (item !== undefined) {
        deps.submit(item.event);
      }
    },
  };
}
