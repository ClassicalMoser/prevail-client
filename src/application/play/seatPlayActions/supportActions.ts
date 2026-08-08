import {
  buildAssignUnitSupportSubmit,
  selectAssignUnitSupportCard,
} from '../selection';
import type { SeatPlayActionsDeps } from './types';
import { unlockDraft } from './unlockDraft';

export function createSupportActions(deps: SeatPlayActionsDeps): {
  onConfirmAssignUnitSupport: () => void;
  onSelectAssignUnitSupportCard: (cardId: string) => void;
} {
  return {
    onConfirmAssignUnitSupport: () => {
      const options = deps.legalOptions();
      if (options === null) {
        return;
      }
      const event = buildAssignUnitSupportSubmit(options, deps.selection());
      if (event !== undefined) {
        deps.submit(event);
      }
    },
    onSelectAssignUnitSupportCard: (cardId) => {
      unlockDraft(deps);
      const options = deps.legalOptions();
      if (options === null) {
        return;
      }
      deps.setSelection(
        selectAssignUnitSupportCard(options, deps.selection(), cardId),
      );
    },
  };
}
