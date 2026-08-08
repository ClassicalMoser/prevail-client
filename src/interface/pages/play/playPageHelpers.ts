import type { PhaseSummary } from '@application';
import type {
  PlayerSide,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';

export function parseSide(raw: string): PlayerSide | undefined {
  if (raw === 'white' || raw === 'black') {
    return raw;
  }
  return undefined;
}

export function isSelectedSetupUnit(
  selected: UnitInstance | undefined,
  unit: UnitInstance,
): boolean {
  return (
    selected !== undefined &&
    selected.instanceNumber === unit.instanceNumber &&
    selected.unitType.id === unit.unitType.id
  );
}

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

/** Engine phase/step for tooltips / debug. */
export function formatPhase(summary: PhaseSummary | undefined): string {
  if (summary === undefined) {
    return '—';
  }
  if (summary.kind === 'none') {
    return 'pre-phase';
  }
  return `${summary.phase} / ${summary.step}`;
}

const titleCaseCamel = (value: string): string =>
  value.replaceAll(/([A-Z])/gu, ' $1').replace(/^./u, (c) => c.toUpperCase());

/** Human-readable phase framing for the play header. */
export function humanPhaseLabel(summary: PhaseSummary | undefined): string {
  if (summary === undefined) {
    return '—';
  }
  if (summary.kind === 'none') {
    return 'Preparing';
  }
  const phase = PHASE_LABELS[summary.phase] ?? titleCaseCamel(summary.phase);
  const step = STEP_LABELS[summary.step] ?? titleCaseCamel(summary.step);
  return `${phase} · ${step}`;
}

const CHOICE_TITLES: Record<string, string> = {
  setupUnits: 'Place units',
  chooseCard: 'Choose a card',
  commitToMelee: 'Commit to melee',
  commitToMovement: 'Commit to movement',
  commitToRangedAttack: 'Commit to ranged',
  chooseRoutDiscard: 'Rout discard',
  assignUnitSupport: 'Assign support',
  issueCommand: 'Issue command',
  doneIssuingCommands: 'Done issuing',
  moveUnit: 'Move unit',
  moveCommander: 'Move commander',
  performRangedAttack: 'Ranged attack',
  chooseMeleeResolution: 'Choose melee',
  chooseRally: 'Rally',
  chooseRetreatOption: 'Retreat',
  chooseWhetherToRetreat: 'Retreat?',
};

export function humanChoiceTitle(choiceType: string): string {
  return CHOICE_TITLES[choiceType] ?? titleCaseCamel(choiceType);
}

export function formatPressureChip(args: {
  routedCount: number;
  lostCommanders: readonly PlayerSide[];
}): string | undefined {
  const parts: string[] = [];
  if (args.routedCount > 0) {
    parts.push(`${args.routedCount} routed`);
  }
  if (args.lostCommanders.length > 0) {
    parts.push(`commanders lost: ${args.lostCommanders.join(', ')}`);
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
}
