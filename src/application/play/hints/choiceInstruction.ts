import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';

const INSTRUCTIONS: Partial<Record<string, string>> = {
  chooseCard: 'Select a highlighted command card from your hand.',
  doneIssuingCommands:
    'No remaining command can be issued (for example ranged slots with no eligible units). End the issue step to continue.',
};

/**
 * Short instruction under the choice title when the panel has no separate hint.
 * Undefined when that choice uses another hint or has no static copy.
 */
function choiceInstruction(
  options: LegalPlayerChoiceOptions | undefined,
): string | undefined {
  if (options === undefined) {
    return;
  }
  const instruction = INSTRUCTIONS[options.choiceType];
  return instruction;
}

export { choiceInstruction };
