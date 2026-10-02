import type { Command } from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import { formatCommandLabel } from './playVisibility';

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

describe('command labels', () => {
  it('names a move of several units in words', () => {
    expect.hasAssertions();
    const label = formatCommandLabel(command('movement', 'units', 2));

    expect(label).toBe('Move 2 units');
  }, 1000);

  it('names a single-line ranged attack without the enum key', () => {
    expect.hasAssertions();
    const label = formatCommandLabel(command('rangedAttack', 'lines', 1));

    expect(label).toBe('Ranged attack 1 line');
  }, 1000);
});
