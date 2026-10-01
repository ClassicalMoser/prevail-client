import type {
  Command,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { formatCommandLabel } from '@application/play/playVisibility';

export function issueCommandLabels(
  options: LegalPlayerChoiceOptions | undefined,
): { index: number; label: string; command: Command }[] {
  if (options === undefined || options.choiceType !== 'issueCommand') {
    return [];
  }
  return options.issueCommands.commands.map((command, index) => ({
    index,
    command,
    label: formatCommandLabel(command),
  }));
}
