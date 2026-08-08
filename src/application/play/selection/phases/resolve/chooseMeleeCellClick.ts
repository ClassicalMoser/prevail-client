import type {
  Coordinate,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

export function chooseMeleeCellClick(args: {
  coordinate: Coordinate;
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseMeleeResolution' }
  >;
  selection: SeatSelection;
}): CellClickResult {
  const { coordinate, options, selection } = args;
  const event = options.events.find((e) => e.space === coordinate);
  if (event === undefined) {
    return { selection };
  }
  return { selection, submit: event };
}
