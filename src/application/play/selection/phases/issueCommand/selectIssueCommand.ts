import type {
  Command,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { getLegalUnitsForIssueCommand } from '@classicalmoser/prevail-rules/domain';
import { emptySelection } from '@application/play/selection/core/emptySelection';
import type { SeatSelection } from '@application/play/selection/core/types';

export function selectIssueCommand(
  options: LegalPlayerChoiceOptions,
  command: Command,
  state: GameState,
): SeatSelection {
  if (options.choiceType !== 'issueCommand') {
    return emptySelection();
  }
  const legal = getLegalUnitsForIssueCommand(
    command,
    options.issueCommands.player,
    state,
  );
  return {
    kind: 'issueCommand',
    command,
    selected: [],
    lineStart: undefined,
    legalUnitCoordinates: legal.map((u) => u.placement.coordinate),
  };
}
