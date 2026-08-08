import { createBoardActions } from './boardActions';
import { createChoiceListActions } from './choiceListActions';
import { createCommitActions } from './commitActions';
import { createDraftActions } from './draftActions';
import { createIssueCommandActions } from './issueCommandActions';
import { createRangedActions } from './rangedActions';
import { createRoutActions } from './routActions';
import { createSetupActions } from './setupActions';
import { createSupportActions } from './supportActions';
import type { SeatPlayActions, SeatPlayActionsDeps } from './types';

/** UI action handlers for the seat play page (no Solid imports). */
export function createSeatPlayActions(
  deps: SeatPlayActionsDeps,
): SeatPlayActions {
  return {
    ...createBoardActions(deps),
    ...createChoiceListActions(deps),
    ...createSetupActions(deps),
    ...createIssueCommandActions(deps),
    ...createCommitActions(deps),
    ...createRangedActions(deps),
    ...createSupportActions(deps),
    ...createRoutActions(deps),
    ...createDraftActions(deps),
  };
}
