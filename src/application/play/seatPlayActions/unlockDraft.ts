import type { SeatPlayActionsDeps } from './types';

export function unlockDraft(deps: SeatPlayActionsDeps): void {
  if (deps.choicePending()) {
    deps.setChoicePending(false);
  }
}
