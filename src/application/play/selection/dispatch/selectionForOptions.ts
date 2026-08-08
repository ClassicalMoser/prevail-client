import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { emptySelection } from '../core/emptySelection';
import type { SeatSelection } from '../core/types';
import { initialIssueCommandSelection } from '../phases/issueCommand/initialSelection';
import { initialMoveUnitSelection } from '../phases/move/initialSelection';
import { initialRangedSelection } from '../phases/ranged/initialSelection';
import { initialRoutSelection } from '../phases/rout/initialSelection';
import { initialSetupSelection } from '../phases/setup/initialSelection';
import { initialSupportSelection } from '../phases/support/initialSelection';

export function selectionForOptions(
  options: LegalPlayerChoiceOptions | null,
): SeatSelection {
  if (options === null) {
    return emptySelection();
  }
  switch (options.choiceType) {
    case 'setupUnits': {
      return initialSetupSelection(options);
    }
    case 'moveUnit': {
      return initialMoveUnitSelection();
    }
    case 'issueCommand': {
      return initialIssueCommandSelection();
    }
    case 'performRangedAttack': {
      return initialRangedSelection(options);
    }
    case 'chooseRoutDiscard': {
      return initialRoutSelection();
    }
    case 'assignUnitSupport': {
      return initialSupportSelection(options);
    }
    default: {
      return emptySelection();
    }
  }
}
