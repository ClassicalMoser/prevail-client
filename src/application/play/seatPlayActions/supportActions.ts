import type { UnitSupport } from '@classicalmoser/prevail-rules/domain';
import {
  buildAssignUnitSupportSubmit,
  selectAssignUnitSupportCard,
} from '../selection';
import type { SeatPlayActionsDeps } from './types';
import { unlockDraft } from './unlockDraft';

export function createSupportActions(deps: SeatPlayActionsDeps): {
  onConfirmAssignUnitSupport: () => void;
  onSelectAssignUnitSupportCard: (card: { unitSupport: UnitSupport }) => void;
} {
  return {
    onConfirmAssignUnitSupport: () => {
      const options = deps.legalOptions();
      if (options === undefined) {
        return;
      }
      const event = buildAssignUnitSupportSubmit(options, deps.selection());
      if (event !== undefined) {
        deps.submit(event);
      }
    },
    onSelectAssignUnitSupportCard: (card) => {
      unlockDraft(deps);
      const options = deps.legalOptions();
      if (options === undefined) {
        return;
      }
      deps.setSelection(
        selectAssignUnitSupportCard(options, deps.selection(), card),
      );
    },
  };
}
