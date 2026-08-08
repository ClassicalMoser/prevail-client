import type {
  Command,
  CommandCard,
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
  UnitFacing,
  UnitInstance,
  UnitPlacement,
  UnitWithPlacement,
} from '@classicalmoser/prevail-rules/domain';
import {
  getLegalPlayerChoiceOptions,
  getLegalUnitMoves,
  getLegalUnitsForIssueCommand,
  getOwnedPlayerCardState,
  PLAYER_CHOICE_EVENT_TYPE,
} from '@classicalmoser/prevail-rules/domain';

export type CellHighlight = 'legal' | 'selected';

export type SeatSelection =
  | { kind: 'idle' }
  | {
      kind: 'setup';
      selectedUnit: UnitInstance | undefined;
      placements: UnitWithPlacement[];
    }
  | {
      kind: 'moveUnit';
      unit: UnitWithPlacement | undefined;
      destinations: UnitPlacement[];
    }
  | {
      kind: 'issueCommand';
      command: Command | undefined;
      units: UnitInstance[];
      legalUnitCoordinates: Coordinate[];
    }
  | {
      kind: 'routDiscard';
      selectedCardIds: string[];
    };

export interface PlayHighlights {
  cells: Readonly<Partial<Record<string, CellHighlight>>>;
  /** Command card ids highlighted as legal / selected. */
  cardIds: Readonly<Partial<Record<string, CellHighlight>>>;
}

export interface ChoiceListItem {
  id: string;
  label: string;
  event: PlayerChoiceEvent;
}

const defaultFacingForSide = (side: PlayerSide): UnitFacing =>
  side === 'white' ? 'north' : 'south';

const unitKey = (unit: UnitInstance): string =>
  `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`;

const concretePlayer = (
  options: LegalPlayerChoiceOptions,
  state: GameState,
): PlayerSide =>
  options.playerSource === 'bothPlayers'
    ? state.currentInitiative
    : options.playerSource;

const isHumanTurn = (
  options: LegalPlayerChoiceOptions | null,
  humanSide: PlayerSide,
): boolean => {
  if (options === null) {
    return false;
  }
  const source = options.playerSource;
  return source === humanSide || source === 'bothPlayers';
};

/** Legal options when it is this seat's turn; otherwise null. */
export function legalOptionsForSeat(
  state: GameState | undefined,
  humanSide: PlayerSide,
): LegalPlayerChoiceOptions | null {
  if (state === undefined) {
    return null;
  }
  let options: LegalPlayerChoiceOptions | null;
  try {
    options = getLegalPlayerChoiceOptions(state);
  } catch {
    return null;
  }
  return isHumanTurn(options, humanSide) ? options : null;
}

export function emptySelection(): SeatSelection {
  return { kind: 'idle' };
}

export function selectionForOptions(
  options: LegalPlayerChoiceOptions | null,
): SeatSelection {
  if (options === null) {
    return emptySelection();
  }
  switch (options.choiceType) {
    case 'setupUnits': {
      return {
        kind: 'setup',
        selectedUnit: options.setupUnits.units[0],
        placements: [],
      };
    }
    case 'moveUnit': {
      return { kind: 'moveUnit', unit: undefined, destinations: [] };
    }
    case 'issueCommand': {
      return {
        kind: 'issueCommand',
        command: undefined,
        units: [],
        legalUnitCoordinates: [],
      };
    }
    case 'chooseRoutDiscard': {
      return { kind: 'routDiscard', selectedCardIds: [] };
    }
    default: {
      return emptySelection();
    }
  }
}

function placementForCoordinate(
  destinations: UnitPlacement[],
  coordinate: Coordinate,
): UnitPlacement | undefined {
  return destinations.find((d) => d.coordinate === coordinate);
}

export function computeHighlights(
  options: LegalPlayerChoiceOptions | null,
  selection: SeatSelection,
): PlayHighlights {
  const cells: Partial<Record<string, CellHighlight>> = {};
  const cardIds: Partial<Record<string, CellHighlight>> = {};

  if (options === null) {
    return { cells, cardIds };
  }

  switch (options.choiceType) {
    case 'setupUnits': {
      for (const coordinate of options.setupUnits.coordinates) {
        cells[coordinate] = 'legal';
      }
      if (selection.kind === 'setup') {
        for (const placement of selection.placements) {
          cells[placement.placement.coordinate] = 'selected';
        }
      }
      break;
    }
    case 'moveCommander': {
      if (options.startingCoordinate !== null) {
        cells[options.startingCoordinate] = 'selected';
      }
      for (const coordinate of options.destinations) {
        cells[coordinate] = 'legal';
      }
      break;
    }
    case 'moveUnit': {
      if (selection.kind === 'moveUnit' && selection.unit !== undefined) {
        cells[selection.unit.placement.coordinate] = 'selected';
        for (const destination of selection.destinations) {
          cells[destination.coordinate] = 'legal';
        }
      } else {
        for (const unit of options.moveUnits.units) {
          cells[unit.placement.coordinate] = 'legal';
        }
      }
      break;
    }
    case 'chooseMeleeResolution': {
      for (const event of options.events) {
        cells[event.space] = 'legal';
      }
      break;
    }
    case 'chooseRetreatOption': {
      for (const event of options.events) {
        cells[event.retreatOption.coordinate] = 'legal';
      }
      break;
    }
    case 'chooseCard': {
      for (const event of options.events) {
        cardIds[event.card.id] = 'legal';
      }
      break;
    }
    case 'commitToMelee':
    case 'commitToMovement':
    case 'commitToRangedAttack': {
      for (const event of options.events) {
        if (typeof event.committedCard === 'object' && event.committedCard) {
          cardIds[event.committedCard.id] = 'legal';
        }
      }
      break;
    }
    case 'chooseRoutDiscard': {
      for (const id of options.routDiscard.cardIds) {
        cardIds[id] =
          selection.kind === 'routDiscard' &&
          selection.selectedCardIds.includes(id)
            ? 'selected'
            : 'legal';
      }
      break;
    }
    case 'issueCommand': {
      if (selection.kind === 'issueCommand') {
        for (const coordinate of selection.legalUnitCoordinates) {
          cells[coordinate] = 'legal';
        }
      }
      break;
    }
    default: {
      break;
    }
  }

  return { cells, cardIds };
}

export function choiceListItems(
  options: LegalPlayerChoiceOptions | null,
): ChoiceListItem[] {
  if (options === null) {
    return [];
  }

  switch (options.choiceType) {
    case 'chooseCard': {
      return options.events.map((event) => ({
        id: event.card.id,
        label: event.card.name,
        event,
      }));
    }
    case 'chooseMeleeResolution': {
      return options.events.map((event) => ({
        id: event.space,
        label: `Resolve ${event.space}`,
        event,
      }));
    }
    case 'chooseRally': {
      return options.events.map((event, index) => ({
        id: `rally-${index}`,
        label: event.performRally ? 'Rally' : 'Skip rally',
        event,
      }));
    }
    case 'chooseRetreatOption': {
      return options.events.map((event) => ({
        id: event.retreatOption.coordinate,
        label: `Retreat to ${event.retreatOption.coordinate}`,
        event,
      }));
    }
    case 'chooseWhetherToRetreat': {
      return options.events.map((event, index) => ({
        id: `retreat-${index}-${String(event.choosesToRetreat)}`,
        label: event.choosesToRetreat ? 'Retreat' : 'Stay',
        event,
      }));
    }
    case 'commitToMelee':
    case 'commitToMovement':
    case 'commitToRangedAttack': {
      return options.events.map((event, index) => ({
        id: `commit-${options.choiceType}-${index}`,
        label:
          typeof event.committedCard === 'object' && event.committedCard
            ? event.committedCard.name
            : `Commit ${options.choiceType}`,
        event,
      }));
    }
    default: {
      return [];
    }
  }
}

export interface CellClickResult {
  selection: SeatSelection;
  submit?: PlayerChoiceEvent;
}

export function handleCellClick(args: {
  coordinate: Coordinate;
  options: LegalPlayerChoiceOptions | null;
  selection: SeatSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, options, selection, state } = args;
  if (options === null) {
    return { selection };
  }

  switch (options.choiceType) {
    case 'setupUnits': {
      if (selection.kind !== 'setup' || selection.selectedUnit === undefined) {
        return { selection };
      }
      if (!options.setupUnits.coordinates.includes(coordinate)) {
        return { selection };
      }
      if (
        selection.placements.some((p) => p.placement.coordinate === coordinate)
      ) {
        return { selection };
      }

      const placement: UnitWithPlacement = {
        unit: selection.selectedUnit,
        placement: {
          coordinate,
          facing: defaultFacingForSide(options.setupUnits.player),
        },
      };
      const placements = [...selection.placements, placement];
      const remaining = options.setupUnits.units.filter(
        (unit) => !placements.some((p) => unitKey(p.unit) === unitKey(unit)),
      );

      if (remaining.length === 0) {
        return {
          selection: emptySelection(),
          submit: {
            eventType: PLAYER_CHOICE_EVENT_TYPE,
            choiceType: 'setupUnits',
            eventNumber: options.expectedEventNumber,
            player: options.setupUnits.player,
            unitPlacements: placements,
          },
        };
      }

      return {
        selection: {
          kind: 'setup',
          selectedUnit: remaining[0],
          placements,
        },
      };
    }
    case 'moveCommander': {
      if (
        options.startingCoordinate === null ||
        !options.destinations.includes(coordinate)
      ) {
        return { selection };
      }
      return {
        selection: emptySelection(),
        submit: {
          eventType: PLAYER_CHOICE_EVENT_TYPE,
          choiceType: 'moveCommander',
          eventNumber: options.expectedEventNumber,
          player: concretePlayer(options, state),
          from: options.startingCoordinate,
          to: coordinate,
        },
      };
    }
    case 'moveUnit': {
      if (selection.kind !== 'moveUnit') {
        return { selection };
      }
      if (selection.unit === undefined) {
        const unit = options.moveUnits.units.find(
          (u) => u.placement.coordinate === coordinate,
        );
        if (unit === undefined) {
          return { selection };
        }
        let destinations: UnitPlacement[] = [];
        try {
          destinations = [...getLegalUnitMoves(unit, state)];
        } catch (error) {
          console.error(error);
        }
        return {
          selection: { kind: 'moveUnit', unit, destinations },
        };
      }

      const to = placementForCoordinate(selection.destinations, coordinate);
      if (to === undefined) {
        return { selection };
      }
      return {
        selection: emptySelection(),
        submit: {
          eventType: PLAYER_CHOICE_EVENT_TYPE,
          choiceType: 'moveUnit',
          eventNumber: options.expectedEventNumber,
          player: options.moveUnits.player,
          unit: selection.unit,
          to,
          moveCommander: false,
        },
      };
    }
    case 'chooseMeleeResolution': {
      const event = options.events.find((e) => e.space === coordinate);
      if (event === undefined) {
        return { selection };
      }
      return { selection: emptySelection(), submit: event };
    }
    case 'chooseRetreatOption': {
      const event = options.events.find(
        (e) => e.retreatOption.coordinate === coordinate,
      );
      if (event === undefined) {
        return { selection };
      }
      return { selection: emptySelection(), submit: event };
    }
    case 'issueCommand': {
      if (
        selection.kind !== 'issueCommand' ||
        selection.command === undefined
      ) {
        return { selection };
      }
      const legal = getLegalUnitsForIssueCommand(
        selection.command,
        options.issueCommands.player,
        state,
      );
      const hit = legal.find((u) => u.placement.coordinate === coordinate);
      if (hit === undefined) {
        return { selection };
      }
      const already = selection.units.some(
        (u) => unitKey(u) === unitKey(hit.unit),
      );
      const units = already
        ? selection.units.filter((u) => unitKey(u) !== unitKey(hit.unit))
        : [...selection.units, hit.unit];
      return {
        selection: {
          ...selection,
          units,
        },
      };
    }
    default: {
      return { selection };
    }
  }
}

export function selectSetupUnit(
  selection: SeatSelection,
  unit: UnitInstance,
): SeatSelection {
  if (selection.kind !== 'setup') {
    return selection;
  }
  if (selection.placements.some((p) => unitKey(p.unit) === unitKey(unit))) {
    return selection;
  }
  return { ...selection, selectedUnit: unit };
}

export function selectIssueCommand(
  options: LegalPlayerChoiceOptions,
  command: Command,
  state: GameState,
): SeatSelection {
  if (options.choiceType !== 'issueCommand') {
    return emptySelection();
  }
  const legal = getLegalUnitsForIssueCommand(
    command,
    options.issueCommands.player,
    state,
  );
  return {
    kind: 'issueCommand',
    command,
    units: [],
    legalUnitCoordinates: legal.map((u) => u.placement.coordinate),
  };
}

export function buildIssueCommandSubmit(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
): PlayerChoiceEvent | undefined {
  if (
    options.choiceType !== 'issueCommand' ||
    selection.kind !== 'issueCommand' ||
    selection.command === undefined ||
    selection.units.length === 0
  ) {
    return undefined;
  }
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'issueCommand',
    eventNumber: options.expectedEventNumber,
    player: options.issueCommands.player,
    command: selection.command,
    units: selection.units,
  };
}

export function toggleRoutDiscardCard(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
  cardId: string,
): { selection: SeatSelection; submit?: PlayerChoiceEvent } {
  if (
    options.choiceType !== 'chooseRoutDiscard' ||
    selection.kind !== 'routDiscard'
  ) {
    return { selection };
  }
  if (!options.routDiscard.cardIds.includes(cardId)) {
    return { selection };
  }

  const selected = selection.selectedCardIds.includes(cardId)
    ? selection.selectedCardIds.filter((id) => id !== cardId)
    : [...selection.selectedCardIds, cardId];

  if (selected.length === options.routDiscard.numberToDiscard) {
    return {
      selection: emptySelection(),
      submit: {
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        choiceType: 'chooseRoutDiscard',
        eventNumber: options.expectedEventNumber,
        player: options.routDiscard.player,
        cardIds: selected,
      },
    };
  }

  return { selection: { kind: 'routDiscard', selectedCardIds: selected } };
}

export function patchEventNumber(
  event: PlayerChoiceEvent,
  eventNumber: number,
): PlayerChoiceEvent {
  return { ...event, eventNumber };
}

export function handCardsFromState(
  state: GameState | undefined,
  side: PlayerSide,
): CommandCard[] {
  if (state === undefined) {
    return [];
  }
  try {
    return getOwnedPlayerCardState(state.cardState, side).inHand;
  } catch {
    return [];
  }
}

export function issueCommandLabels(
  options: LegalPlayerChoiceOptions | null,
): { index: number; label: string; command: Command }[] {
  if (options === null || options.choiceType !== 'issueCommand') {
    return [];
  }
  return options.issueCommands.commands.map((command, index) => ({
    index,
    command,
    label: `${command.type} ×${command.number} (${command.size})`,
  }));
}
