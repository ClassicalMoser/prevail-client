import { toggleRoutDiscardCard } from '../selection';
import type { SeatPlayActionsDeps } from './types';
import { unlockDraft } from './unlockDraft';

export function createRoutActions(deps: SeatPlayActionsDeps): {
  onToggleRoutCard: (cardId: string) => void;
} {
  return {
    onToggleRoutCard: (cardId) => {
      unlockDraft(deps);
      const options = deps.legalOptions();
      if (options === null) {
        return;
      }
      const result = toggleRoutDiscardCard(options, deps.selection(), cardId);
      deps.setSelection(result.selection);
      if (result.submit !== undefined) {
        deps.submit(result.submit);
      }
    },
  };
}
