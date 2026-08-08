import type {
  Board,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type { ChoiceListItem } from '../core/types';
import { itemsForCommit } from '../phases/commit';
import {
  itemsForChooseCard,
  itemsForMeleeResolution,
  itemsForRally,
  itemsForRetreatOption,
  itemsForWhetherToRetreat,
} from '../phases/resolve';

export function choiceListItems(
  options: LegalPlayerChoiceOptions | null,
  board?: Board,
): ChoiceListItem[] {
  if (options === null) {
    return [];
  }

  switch (options.choiceType) {
    case 'chooseCard': {
      return itemsForChooseCard(options);
    }
    case 'chooseMeleeResolution': {
      return itemsForMeleeResolution(options, board);
    }
    case 'chooseRally': {
      return itemsForRally(options);
    }
    case 'chooseRetreatOption': {
      return itemsForRetreatOption(options);
    }
    case 'chooseWhetherToRetreat': {
      return itemsForWhetherToRetreat(options);
    }
    case 'commitToMelee':
    case 'commitToMovement':
    case 'commitToRangedAttack': {
      return itemsForCommit(options);
    }
    default: {
      return [];
    }
  }
}
