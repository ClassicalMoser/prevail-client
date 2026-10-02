import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import { choiceInstruction } from './choiceInstruction';

describe('choice instructions', () => {
  it('instructs choose-card without showing the choice type key', () => {
    expect.hasAssertions();
    // Spec only needs choiceType; full LegalPlayerChoiceOptions is overkill here.
    const options = {
      choiceType: 'chooseCard',
    } as LegalPlayerChoiceOptions;
    const instruction = choiceInstruction(options);

    expect(instruction).toBe(
      'Select a highlighted command card from your hand.',
    );
  }, 1000);

  it('returns nothing when the choice has no static instruction', () => {
    expect.hasAssertions();
    // Spec only needs choiceType; full LegalPlayerChoiceOptions is overkill here.
    const options = {
      choiceType: 'moveUnit',
    } as LegalPlayerChoiceOptions;
    const instruction = choiceInstruction(options);

    expect(instruction).toBeUndefined();
  }, 1000);
});
