import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
} from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';
import { canConfirmAssignUnitSupport } from './canConfirmAssignUnitSupport';

export function buildAssignUnitSupportSubmit(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
): PlayerChoiceEvent | undefined {
  if (
    options.choiceType !== 'assignUnitSupport' ||
    selection.kind !== 'assignUnitSupport' ||
    !canConfirmAssignUnitSupport(selection, options)
  ) {
    return undefined;
  }
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'assignUnitSupport',
    eventNumber: options.expectedEventNumber,
    player: options.assignUnitSupport.player,
    assignments: selection.assignments.filter(
      (assignment) => assignment.units.length > 0,
    ),
  };
}
