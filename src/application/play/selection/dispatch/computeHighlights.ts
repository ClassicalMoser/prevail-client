import type {
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { emptyHighlightDraft, finalizeHighlights } from '../core';
import type { PlayHighlights, SeatSelection } from '../core/types';
import { applyCommitCardHighlights } from '../phases/commit';
import { applyIssueCommandHighlights } from '../phases/issueCommand';
import {
  applyMoveCommanderHighlights,
  applyMoveUnitHighlights,
} from '../phases/move';
import { applyRangedHighlights } from '../phases/ranged';
import {
  applyChooseCardHighlights,
  applyMeleeResolutionHighlights,
  applyRetreatOptionHighlights,
} from '../phases/resolve';
import { applyRoutDiscardHighlights } from '../phases/rout';
import { applySetupHighlights } from '../phases/setup';
import { applySupportHighlights } from '../phases/support';

export function computeHighlights(
  options: LegalPlayerChoiceOptions | null,
  selection: SeatSelection,
  state?: GameState,
): PlayHighlights {
  const draft = emptyHighlightDraft();
  if (options === null) {
    return finalizeHighlights(draft);
  }

  switch (options.choiceType) {
    case 'setupUnits': {
      applySetupHighlights(draft, options, selection);
      break;
    }
    case 'moveCommander': {
      applyMoveCommanderHighlights(draft, options);
      break;
    }
    case 'moveUnit': {
      applyMoveUnitHighlights(draft, options, selection);
      break;
    }
    case 'chooseMeleeResolution': {
      applyMeleeResolutionHighlights(draft, options);
      break;
    }
    case 'chooseRetreatOption': {
      applyRetreatOptionHighlights(draft, options);
      break;
    }
    case 'chooseCard': {
      applyChooseCardHighlights(draft, options);
      break;
    }
    case 'commitToMelee':
    case 'commitToMovement':
    case 'commitToRangedAttack': {
      applyCommitCardHighlights(draft, options);
      break;
    }
    case 'chooseRoutDiscard': {
      applyRoutDiscardHighlights(draft, options, selection);
      break;
    }
    case 'assignUnitSupport': {
      applySupportHighlights(draft, options, selection, state);
      break;
    }
    case 'issueCommand': {
      applyIssueCommandHighlights(draft, selection);
      break;
    }
    case 'performRangedAttack': {
      applyRangedHighlights(draft, selection);
      break;
    }
    default: {
      break;
    }
  }

  return finalizeHighlights(draft);
}
