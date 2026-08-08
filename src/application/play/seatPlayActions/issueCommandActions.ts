import {
  buildDoneIssuingSubmit,
  buildIssueCommandSubmit,
  issueCommandLabels,
  selectIssueCommand,
} from '../selection';
import type { SeatPlayActionsDeps } from './types';
import { unlockDraft } from './unlockDraft';

export function createIssueCommandActions(deps: SeatPlayActionsDeps): {
  onSelectIssueCommand: (index: number) => void;
  onConfirmIssueCommand: () => void;
  onDoneIssuingCommands: () => void;
} {
  return {
    onSelectIssueCommand: (index) => {
      unlockDraft(deps);
      const options = deps.legalOptions();
      const state = deps.readGameState();
      if (options === null || state === undefined) {
        return;
      }
      const entry = issueCommandLabels(options)[index];
      if (entry === undefined) {
        return;
      }
      deps.setSelection(selectIssueCommand(options, entry.command, state));
    },
    onConfirmIssueCommand: () => {
      const options = deps.legalOptions();
      if (options === null) {
        return;
      }
      const event = buildIssueCommandSubmit(options, deps.selection());
      if (event !== undefined) {
        deps.submit(event);
      }
    },
    onDoneIssuingCommands: () => {
      const event = buildDoneIssuingSubmit(deps.legalOptions());
      if (event !== undefined) {
        deps.submit(event);
      }
    },
  };
}
