import type { UnitInstance } from '@classicalmoser/prevail-rules/domain';
import { selectSetupUnit } from '../selection';
import type { SeatPlayActionsDeps } from './types';
import { unlockDraft } from './unlockDraft';

export function createSetupActions(deps: SeatPlayActionsDeps): {
  onSelectSetupUnit: (unit: UnitInstance) => void;
} {
  return {
    onSelectSetupUnit: (unit) => {
      unlockDraft(deps);
      deps.setSelection(selectSetupUnit(deps.selection(), unit));
    },
  };
}
