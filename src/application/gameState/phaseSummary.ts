import type { GameState } from '@classicalmoser/prevail-rules/domain';

/** Safe phase readout; never calls `getExpectedEvent` (throws when phase is `'none'`). */
type PhaseSummary =
  | { kind: 'none' }
  | { kind: 'phase'; phase: string; step: string };

const PHASE_LABELS: Record<string, string> = {
  playCards: 'Play cards',
  issueCommands: 'Issue commands',
  resolveMelee: 'Melee',
  resolveRanged: 'Ranged',
  moveCommanders: 'Commanders',
  cleanup: 'Cleanup',
  setup: 'Setup',
};

const STEP_LABELS: Record<string, string> = {
  chooseCard: 'Choose card',
  reveal: 'Reveal',
  commit: 'Commit',
  resolveMelee: 'Resolve',
  complete: 'Complete',
  issue: 'Issue',
  move: 'Move',
  ranged: 'Attack',
  rout: 'Rout',
  rally: 'Rally',
  retreat: 'Retreat',
};

function phaseSummaryFromState(state: GameState): PhaseSummary {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (phaseState === 'none') {
    const summary: PhaseSummary = { kind: 'none' };
    return summary;
  }
  const summary: PhaseSummary = {
    kind: 'phase',
    phase: phaseState.phase,
    step: phaseState.step,
  };
  return summary;
}

function titleCaseCamel(value: string): string {
  const spaced = value.replaceAll(/([A-Z])/gu, ' $1');
  const titled = spaced.replace(/^./u, (character) => character.toUpperCase());
  return titled;
}

/**
 * Player-facing phase line.
 * Known phase and step keys use the table. An unknown key is spaced from camelCase
 * so a new rules step still reads as words.
 */
function phaseLabel(summary?: PhaseSummary): string {
  if (summary === undefined) {
    const missing = '—';
    return missing;
  }
  if (summary.kind === 'none') {
    const preparing = 'Preparing';
    return preparing;
  }
  const phase = PHASE_LABELS[summary.phase] ?? titleCaseCamel(summary.phase);
  const step = STEP_LABELS[summary.step] ?? titleCaseCamel(summary.step);
  const label = `${phase} · ${step}`;
  return label;
}

export { type PhaseSummary, phaseSummaryFromState, phaseLabel };
