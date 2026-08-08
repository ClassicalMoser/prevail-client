import { resetStagedSelection, undoStagedSelection } from '../selection';
import type { SeatPlayActionsDeps } from './types';

export function createDraftActions(deps: SeatPlayActionsDeps): {
  onUndo: () => void;
  onResetSelection: () => void;
  onRetryLastChoice: () => void;
  clearRejection: () => void;
} {
  return {
    onUndo: () => {
      deps.setChoicePending(false);
      deps.setSelection(
        undoStagedSelection(
          deps.selection(),
          deps.legalOptions(),
          deps.readGameState(),
        ),
      );
    },
    onResetSelection: () => {
      deps.setChoicePending(false);
      deps.setChoiceRejected(undefined);
      deps.setSelection(
        resetStagedSelection(deps.legalOptions(), deps.readGameState()),
      );
    },
    onRetryLastChoice: () => {
      const attempt = deps.lastAttempt();
      deps.setChoicePending(false);
      deps.setChoiceRejected(undefined);
      if (attempt === undefined) {
        return;
      }
      deps.submit(attempt);
    },
    clearRejection: () => {
      deps.setChoicePending(false);
      deps.setChoiceRejected(undefined);
    },
  };
}
