import { describe, expect, it } from 'vite-plus/test';
import { phaseLabel } from './phaseSummary';
import type { PhaseSummary } from './phaseSummary';

describe('phase labels', () => {
  it('uses a dash when there is no summary', () => {
    expect.hasAssertions();
    const label = phaseLabel();

    expect(label).toBe('—');
  }, 1000);

  it('calls the pre-phase Preparing', () => {
    expect.hasAssertions();
    const summary: PhaseSummary = { kind: 'none' };
    const label = phaseLabel(summary);

    expect(label).toBe('Preparing');
  }, 1000);

  it('names a known phase and step in words', () => {
    expect.hasAssertions();
    const summary: PhaseSummary = {
      kind: 'phase',
      phase: 'playCards',
      step: 'chooseCard',
    };
    const label = phaseLabel(summary);

    expect(label).toBe('Play cards · Choose card');
  }, 1000);
});
