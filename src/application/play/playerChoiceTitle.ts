/**
 * Player-facing title for the choice the seat is being asked to make.
 * An unknown type is spaced from camelCase so a new rules choice still reads as words.
 */
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

function titleCaseCamel(value: string): string {
  const spaced = value.replaceAll(/([A-Z])/gu, ' $1');
  const titled = spaced.replace(/^./u, (character) => character.toUpperCase());
  return titled;
}

function playerChoiceTitle(choiceType?: string): string | undefined {
  if (choiceType === undefined) {
    return;
  }
  const known = CHOICE_TITLES[choiceType];
  if (known !== undefined) {
    return known;
  }
  const fallback = titleCaseCamel(choiceType);
  return fallback;
}

export { playerChoiceTitle };
