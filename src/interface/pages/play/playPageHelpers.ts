import type { PlayerSide, UnitInstance } from '@classicalmoser/prevail-rules/domain';

function parseSide(raw: string): PlayerSide | undefined {
  if (raw === 'white' || raw === 'black') {
    return raw;
  }
  return undefined;
}

function isSelectedSetupUnit(
  selected: UnitInstance | undefined,
  unit: UnitInstance,
): boolean {
  return (
    selected !== undefined &&
    selected.instanceNumber === unit.instanceNumber &&
    selected.unitType.id === unit.unitType.id
  );
}

const titleCaseCamel = (value: string): string =>
  value.replaceAll(/([A-Z])/gu, ' $1').replace(/^./u, (c) => c.toUpperCase());

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

function humanChoiceTitle(choiceType: string): string {
  return CHOICE_TITLES[choiceType] ?? titleCaseCamel(choiceType);
}

function formatPressureChip(args: {
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

export {
  parseSide,
  isSelectedSetupUnit,
  humanChoiceTitle,
  formatPressureChip,
};
