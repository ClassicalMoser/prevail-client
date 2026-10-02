import type { Command } from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import { waitHint } from './waitHint';

function command(
  type: Command['type'],
  size: Command['size'],
  number: number,
): Command {
  const value: Command = {
    type,
    size,
    number,
    restrictions: {
      inspirationRangeRestriction: -1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
    modifiers: [],
  };
  return value;
}

describe('wait hints', () => {
  it('names remaining commands in words while waiting to issue', () => {
    expect.hasAssertions();
    const hint = waitHint({
      options: undefined,
      side: 'white',
      phaseSummary: {
        kind: 'phase',
        phase: 'issueCommands',
        step: 'Resolve commands',
      },
      remaining: {
        white: [command('movement', 'units', 2)],
      },
      playCardSlots: {
        you: { kind: 'empty', label: 'No card yet' },
        opponent: { kind: 'empty', label: 'No card yet' },
      },
    });

    expect(hint).toBe(
      'Waiting for opponent to finish resolving — then you issue: Move 2 units',
    );
  }, 1000);
});
