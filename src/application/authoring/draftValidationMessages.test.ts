import { describe, expect, it } from 'vite-plus/test';
import { draftValidationMessages } from './draftValidationMessages';

describe('draft validation messages', () => {
  it('keeps the Zod message and drops the schema path', () => {
    expect.hasAssertions();
    const messages = draftValidationMessages([
      { path: ['units', 0, 'count'], message: 'Number must be greater than 0' },
    ]);

    expect(messages).toStrictEqual(['Number must be greater than 0']);
  }, 1000);

  it('keeps a root message when there is no path', () => {
    expect.hasAssertions();
    const messages = draftValidationMessages([
      { path: [], message: 'Invalid army' },
    ]);

    expect(messages).toStrictEqual(['Invalid army']);
  }, 1000);
});
