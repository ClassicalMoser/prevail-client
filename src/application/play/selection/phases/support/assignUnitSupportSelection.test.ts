import {
  addUnitToBoard,
  createEmptyGameState,
  createUnitInstance,
  tempCommandCards,
  tempUnits,
  updateBoardState,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Coordinate,
  LegalPlayerChoiceOptions,
  UnitInstance,
  UnitSupport,
} from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import { emptyHighlightDraft } from '@application/play/selection/core/highlightDraft';
import type { SeatSelection } from '@application/play/selection/core/types';
import { applySupportHighlights } from './applySupportHighlights';
import { buildAssignUnitSupportSubmit } from './buildAssignUnitSupportSubmit';
import { canConfirmAssignUnitSupport } from './canConfirmAssignUnitSupport';
import { handleSupportCellClick } from './handleSupportCellClick';
import { initialSupportSelection } from './initialSelection';
import { selectAssignUnitSupportCard } from './selectAssignUnitSupportCard';

const velites = tempUnits[0];
const legion = tempUnits[1];

const genericSupport = (count: number): UnitSupport => ({
  count,
  supportType: 'generic',
});

const velitesSupport = (count: number): UnitSupport => ({
  count,
  supportType: 'unitType',
  unitTypeId: velites.id,
});

function whiteUnit(
  unitType: (typeof tempUnits)[number],
  n: number,
): UnitInstance {
  return createUnitInstance('white', unitType, n);
}

function supportOptions(
  categories: {
    unitSupport: UnitSupport;
    eligibleUnits: readonly UnitInstance[];
  }[],
): Extract<LegalPlayerChoiceOptions, { choiceType: 'assignUnitSupport' }> {
  return {
    assignUnitSupport: { categories, player: 'white' },
    choiceType: 'assignUnitSupport',
    expectedEventNumber: 4,
    playerSource: 'white',
  };
}

function draft(
  activeSupport: UnitSupport | undefined,
  assignments: { unitSupport: UnitSupport; units: UnitInstance[] }[],
): SeatSelection {
  return { activeSupport, assignments, kind: 'assignUnitSupport' };
}

describe('assign unit support selection', () => {
  const skirmisher = whiteUnit(velites, 1);
  const heavy = whiteUnit(legion, 1);

  it('starts on the first summed category', () => {
    expect.hasAssertions();
    const options = supportOptions([
      { eligibleUnits: [skirmisher, heavy], unitSupport: genericSupport(2) },
      { eligibleUnits: [skirmisher], unitSupport: velitesSupport(1) },
    ]);

    expect(initialSupportSelection(options)).toStrictEqual({
      activeSupport: genericSupport(2),
      assignments: [],
      kind: 'assignUnitSupport',
    });
  }, 1000);

  it('selects the summed category that matches the tapped card kind', () => {
    expect.hasAssertions();
    const options = supportOptions([
      { eligibleUnits: [skirmisher], unitSupport: velitesSupport(3) },
    ]);
    const selection = draft(undefined, []);
    const card = {
      ...tempCommandCards[0],
      unitSupport: velitesSupport(1),
    };

    expect(selectAssignUnitSupportCard(options, selection, card)).toMatchObject(
      {
        activeSupport: velitesSupport(3),
      },
    );
  }, 1000);

  it('assigns a board unit to the active category and toggles it off', () => {
    expect.hasAssertions();
    const options = supportOptions([
      { eligibleUnits: [skirmisher], unitSupport: genericSupport(1) },
    ]);
    let state = createEmptyGameState('mini');
    state = updateBoardState(
      state,
      addUnitToBoard(state.boardState, {
        placement: { coordinate: 'E-5', facing: 'south' },
        unit: skirmisher,
      }),
    );
    const selection = initialSupportSelection(options);

    const assigned = handleSupportCellClick({
      coordinate: 'E-5',
      options,
      selection,
      state,
    });

    expect(assigned.selection).toMatchObject({
      assignments: [{ unitSupport: genericSupport(1), units: [skirmisher] }],
    });

    const cleared = handleSupportCellClick({
      coordinate: 'E-5',
      options,
      selection: assigned.selection,
      state,
    });

    expect(cleared.selection).toMatchObject({ assignments: [] });
  }, 1000);

  it('refuses another unit once the category count is full', () => {
    expect.hasAssertions();
    const options = supportOptions([
      { eligibleUnits: [skirmisher, heavy], unitSupport: genericSupport(1) },
    ]);
    const selection = draft(genericSupport(1), [
      { unitSupport: genericSupport(1), units: [skirmisher] },
    ]);
    let state = createEmptyGameState('mini');
    state = updateBoardState(
      state,
      addUnitToBoard(state.boardState, {
        placement: { coordinate: 'E-6', facing: 'south' },
        unit: heavy,
      }),
    );

    const result = handleSupportCellClick({
      coordinate: 'E-6',
      options,
      selection,
      state,
    });

    expect(result.selection).toBe(selection);
  }, 1000);

  it('moves a unit onto the active category and off any other grant', () => {
    expect.hasAssertions();
    const options = supportOptions([
      { eligibleUnits: [skirmisher, heavy], unitSupport: genericSupport(2) },
      { eligibleUnits: [skirmisher], unitSupport: velitesSupport(1) },
    ]);
    const selection = draft(velitesSupport(1), [
      { unitSupport: genericSupport(2), units: [skirmisher, heavy] },
    ]);
    let state = createEmptyGameState('mini');
    state = updateBoardState(
      state,
      addUnitToBoard(state.boardState, {
        placement: { coordinate: 'E-5', facing: 'south' },
        unit: skirmisher,
      }),
    );

    const result = handleSupportCellClick({
      coordinate: 'E-5' satisfies Coordinate,
      options,
      selection,
      state,
    });

    expect(result.selection).toMatchObject({
      assignments: [
        { unitSupport: genericSupport(2), units: [heavy] },
        { unitSupport: velitesSupport(1), units: [skirmisher] },
      ],
    });
  }, 1000);

  it('confirms only when no unused slot can still cover someone', () => {
    expect.hasAssertions();
    const options = supportOptions([
      { eligibleUnits: [skirmisher, heavy], unitSupport: genericSupport(2) },
      { eligibleUnits: [skirmisher], unitSupport: velitesSupport(1) },
    ]);

    const partial = draft(genericSupport(2), [
      { unitSupport: genericSupport(2), units: [heavy] },
    ]);
    expect(canConfirmAssignUnitSupport(partial, options)).toBe(false);

    const maximal = draft(genericSupport(2), [
      { unitSupport: genericSupport(2), units: [skirmisher, heavy] },
    ]);
    expect(canConfirmAssignUnitSupport(maximal, options)).toBe(true);

    expect(buildAssignUnitSupportSubmit(options, maximal)).toStrictEqual({
      assignments: [
        { unitSupport: genericSupport(2), units: [skirmisher, heavy] },
      ],
      choiceType: 'assignUnitSupport',
      eventNumber: 4,
      eventType: 'playerChoice',
      player: 'white',
    });
  }, 1000);

  it('lights hand cards of a category and uncovered units of the active one', () => {
    expect.hasAssertions();
    const options = supportOptions([
      { eligibleUnits: [skirmisher, heavy], unitSupport: genericSupport(2) },
      { eligibleUnits: [skirmisher], unitSupport: velitesSupport(1) },
    ]);
    const genericCard = {
      ...tempCommandCards[0],
      id: '00000000-0000-4000-8000-0000000000aa',
      unitSupport: genericSupport(1),
    };
    const velitesCard = {
      ...tempCommandCards[1],
      id: '00000000-0000-4000-8000-0000000000bb',
      unitSupport: velitesSupport(1),
    };
    let state = createEmptyGameState('mini');
    state.cardState.white.inHand = [genericCard, velitesCard];
    state = updateBoardState(
      state,
      addUnitToBoard(state.boardState, {
        placement: { coordinate: 'E-5', facing: 'south' },
        unit: skirmisher,
      }),
    );
    const selection = draft(genericSupport(2), []);
    const draftHighlights = emptyHighlightDraft();

    applySupportHighlights(draftHighlights, { options, selection, state });

    expect(draftHighlights.cardIds[genericCard.id]).toBe('selected');
    expect(draftHighlights.cardIds[velitesCard.id]).toBe('legal');
    expect(draftHighlights.cells['E-5']).toBe('legal');
  }, 1000);
});
