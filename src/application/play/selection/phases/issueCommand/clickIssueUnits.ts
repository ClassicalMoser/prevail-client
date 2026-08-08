import type {
  Command,
  Coordinate,
  GameState,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { getLegalUnitsForIssueCommand } from '@classicalmoser/prevail-rules/domain';
import { unitKey } from '@application/play/selection/core';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

type IssueSelection = Extract<SeatSelection, { kind: 'issueCommand' }>;

export function clickIssueUnits(args: {
  coordinate: Coordinate;
  command: Command;
  player: PlayerSide;
  issueSelection: IssueSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, command, player, issueSelection, state } = args;
  const legal = getLegalUnitsForIssueCommand(command, player, state);
  const hit = legal.find((u) => u.placement.coordinate === coordinate);
  if (hit === undefined) {
    return { selection: issueSelection };
  }
  const already = issueSelection.selected.some(
    (u) => unitKey(u.unit) === unitKey(hit.unit),
  );
  if (already) {
    return {
      selection: {
        ...issueSelection,
        selected: issueSelection.selected.filter(
          (u) => unitKey(u.unit) !== unitKey(hit.unit),
        ),
      },
    };
  }
  // `command.number` is a selection cap — refuse going over.
  if (issueSelection.selected.length >= command.number) {
    return { selection: issueSelection };
  }
  return {
    selection: {
      ...issueSelection,
      selected: [...issueSelection.selected, hit],
    },
  };
}
