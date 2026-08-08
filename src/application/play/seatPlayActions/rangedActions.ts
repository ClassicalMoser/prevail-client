import { buildPerformRangedAttackSubmit } from '../selection';
import type { SeatPlayActionsDeps } from './types';

export function createRangedActions(deps: SeatPlayActionsDeps): {
  onConfirmPerformRangedAttack: () => void;
} {
  return {
    onConfirmPerformRangedAttack: () => {
      const options = deps.legalOptions();
      if (options === null) {
        return;
      }
      const event = buildPerformRangedAttackSubmit(options, deps.selection());
      if (event !== undefined) {
        deps.submit(event);
      }
    },
  };
}
