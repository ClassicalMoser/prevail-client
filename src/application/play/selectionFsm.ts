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
  getLegalLineEndsForIssueCommand,
  getLegalPlayerChoiceOptions,
  getLegalUnitMoves,
  getLegalUnitsForIssueCommand,
  getLineSegmentFromStart,
  getOwnedPlayerCardState,
  isSameUnitInstance,
  PLAYER_CHOICE_EVENT_TYPE,
  playerChoiceEventSchema,
} from '@classicalmoser/prevail-rules/domain';
import { cloneDraft } from '@application/authoring';
import { formatCommandLabel } from './playVisibility';

export type CellHighlight = 'legal' | 'selected';

export type SeatSelection =
  | { kind: 'idle' }
  | {
      kind: 'setup';
      selectedUnit: UnitInstance | undefined;
      placements: UnitWithPlacement[];
      /** After all units are placed, click a unit cell to stack the commander. */
      awaitingCommander: boolean;
      commanderCoordinate: Coordinate | undefined;
    }
  | {
      kind: 'moveUnit';
      unit: UnitWithPlacement | undefined;
      destinations: UnitPlacement[];
    }
  | {
      kind: 'issueCommand';
      command: Command | undefined;
      /** Units size: toggled picks. Lines size: start–end segment once end is chosen. */
      selected: UnitWithPlacement[];
      /** Lines size: chosen line start before end. */
      lineStart: UnitWithPlacement | undefined;
      legalUnitCoordinates: Coordinate[];
    }
  | {
      kind: 'routDiscard';
      selectedCardIds: string[];
    };

export interface PlayHighlights {
  cells: Readonly<Partial<Record<string, CellHighlight>>>;
  /** Cells that should show the eight-direction facing picker. */
  facingPickerCells: ReadonlySet<string>;
  /** Command card ids highlighted as legal / selected. */
  cardIds: Readonly<Partial<Record<string, CellHighlight>>>;
}

export interface ChoiceListItem {
  id: string;
  label: string;
  event: PlayerChoiceEvent;
}

/** Default facing into the board from each side's setup belt. */
export const defaultFacingForSide = (side: PlayerSide): UnitFacing =>
  side === 'white' ? 'south' : 'north';

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
        awaitingCommander: false,
        commanderCoordinate: undefined,
      };
    }
    case 'moveUnit': {
      return { kind: 'moveUnit', unit: undefined, destinations: [] };
    }
    case 'issueCommand': {
      return {
        kind: 'issueCommand',
        command: undefined,
        selected: [],
        lineStart: undefined,
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
  const facingPickerCells = new Set<string>();

  if (options === null) {
    return { cells, cardIds, facingPickerCells };
  }

  switch (options.choiceType) {
    case 'setupUnits': {
      if (selection.kind === 'setup' && selection.awaitingCommander) {
        // Commander may sit alone or stack with a unit — any empty setup-zone cell.
        for (const coordinate of options.setupUnits.coordinates) {
          cells[coordinate] = 'legal';
        }
        break;
      }
      const placed = new Set(
        selection.kind === 'setup'
          ? selection.placements.map((p) => p.placement.coordinate)
          : [],
      );
      for (const coordinate of options.setupUnits.coordinates) {
        if (placed.has(coordinate)) {
          cells[coordinate] = 'selected';
          continue;
        }
        cells[coordinate] = 'legal';
        if (
          selection.kind === 'setup' &&
          selection.selectedUnit !== undefined
        ) {
          facingPickerCells.add(coordinate);
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
        for (const picked of selection.selected) {
          cells[picked.placement.coordinate] = 'selected';
        }
        if (selection.lineStart !== undefined) {
          cells[selection.lineStart.placement.coordinate] = 'selected';
        }
      }
      break;
    }
    default: {
      break;
    }
  }

  return { cells, cardIds, facingPickerCells };
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

function placeSetupUnit(args: {
  coordinate: Coordinate;
  facing: UnitFacing;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>;
  selection: Extract<SeatSelection, { kind: 'setup' }>;
}): CellClickResult {
  const { coordinate, facing, options, selection } = args;
  if (selection.selectedUnit === undefined) {
    return { selection };
  }
  if (!options.setupUnits.coordinates.includes(coordinate)) {
    return { selection };
  }
  if (selection.placements.some((p) => p.placement.coordinate === coordinate)) {
    return { selection };
  }

  const placement: UnitWithPlacement = {
    unit: selection.selectedUnit,
    placement: { coordinate, facing },
  };
  const placements = [...selection.placements, placement];
  const remaining = options.setupUnits.units.filter(
    (unit) => !placements.some((p) => unitKey(p.unit) === unitKey(unit)),
  );

  if (remaining.length === 0) {
    return {
      selection: {
        kind: 'setup',
        selectedUnit: undefined,
        placements,
        awaitingCommander: true,
        commanderCoordinate: undefined,
      },
    };
  }

  return {
    selection: {
      kind: 'setup',
      selectedUnit: remaining[0],
      placements,
      awaitingCommander: false,
      commanderCoordinate: undefined,
    },
  };
}

function buildSetupSubmit(
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>,
  placements: UnitWithPlacement[],
  commanderCoordinate: Coordinate,
): PlayerChoiceEvent {
  // Strip Solid store proxies — Zod on the seat wire rejects non-plain graphs.
  return cloneDraft({
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'setupUnits' as const,
    eventNumber: options.expectedEventNumber,
    player: options.setupUnits.player,
    unitPlacements: placements,
    commanderCoordinate,
  });
}

/** Format Zod issues for seat choiceRejected / local preflight. */
export function formatPlayerChoiceZodIssues(
  issues: readonly { path: PropertyKey[]; message: string }[],
): string {
  return issues
    .slice(0, 5)
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

/**
 * Validate a choice against the wire schema before send. Returns the parsed
 * plain event, or an errorReason suitable for choiceRejected.
 */
export function preflightPlayerChoice(
  choice: PlayerChoiceEvent,
):
  | { ok: true; choice: PlayerChoiceEvent }
  | { ok: false; errorReason: string } {
  const parsed = playerChoiceEventSchema.safeParse(cloneDraft(choice));
  if (!parsed.success) {
    return {
      ok: false,
      errorReason: `Invalid playerChoice (${formatPlayerChoiceZodIssues(parsed.error.issues)})`,
    };
  }
  return { ok: true, choice: parsed.data };
}

/**
 * Select a setup unit to place. If it was already staged, lift it off the
 * board so it can be repositioned (also exits commander-wait).
 */
export function selectSetupUnit(
  selection: SeatSelection,
  unit: UnitInstance,
): SeatSelection {
  if (selection.kind !== 'setup') {
    return selection;
  }
  const placements = selection.placements.filter(
    (p) => unitKey(p.unit) !== unitKey(unit),
  );
  return {
    kind: 'setup',
    selectedUnit: unit,
    placements,
    awaitingCommander: false,
    commanderCoordinate: undefined,
  };
}

/**
 * Place the selected setup unit by choosing a facing arrow on a legal cell.
 */
export function handleFacingClick(args: {
  coordinate: Coordinate;
  facing: UnitFacing;
  options: LegalPlayerChoiceOptions | null;
  selection: SeatSelection;
}): CellClickResult {
  const { coordinate, facing, options, selection } = args;
  if (options === null || options.choiceType !== 'setupUnits') {
    return { selection };
  }
  if (selection.kind !== 'setup') {
    return { selection };
  }
  return placeSetupUnit({ coordinate, facing, options, selection });
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
      if (selection.kind !== 'setup') {
        return { selection };
      }
      if (!selection.awaitingCommander) {
        // Click a staged unit to pick it up and reposition before commit.
        const staged = selection.placements.find(
          (p) => p.placement.coordinate === coordinate,
        );
        if (staged !== undefined) {
          return {
            selection: selectSetupUnit(selection, staged.unit),
          };
        }
        // Fresh placement commits via facing arrows ({@link handleFacingClick}).
        return { selection };
      }
      if (!options.setupUnits.coordinates.includes(coordinate)) {
        return { selection };
      }
      // Keep staged placements until the server accepts (or rejects).
      return {
        selection,
        submit: buildSetupSubmit(options, selection.placements, coordinate),
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
        selection,
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
        selection,
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
      return { selection, submit: event };
    }
    case 'chooseRetreatOption': {
      const event = options.events.find(
        (e) => e.retreatOption.coordinate === coordinate,
      );
      if (event === undefined) {
        return { selection };
      }
      return { selection, submit: event };
    }
    case 'issueCommand': {
      if (
        selection.kind !== 'issueCommand' ||
        selection.command === undefined
      ) {
        return { selection };
      }
      const command = selection.command;
      const player = options.issueCommands.player;

      if (command.size === 'lines') {
        if (selection.lineStart === undefined) {
          const starts = getLegalUnitsForIssueCommand(command, player, state);
          const start = starts.find(
            (u) => u.placement.coordinate === coordinate,
          );
          if (start === undefined) {
            return { selection };
          }
          const ends = getLegalLineEndsForIssueCommand(
            command,
            player,
            state,
            start,
          );
          return {
            selection: {
              ...selection,
              lineStart: start,
              selected: [],
              legalUnitCoordinates: ends.map((u) => u.placement.coordinate),
            },
          };
        }

        if (selection.lineStart.placement.coordinate === coordinate) {
          // Re-click start to clear and pick again.
          const starts = getLegalUnitsForIssueCommand(command, player, state);
          return {
            selection: {
              ...selection,
              lineStart: undefined,
              selected: [],
              legalUnitCoordinates: starts.map((u) => u.placement.coordinate),
            },
          };
        }

        const ends = getLegalLineEndsForIssueCommand(
          command,
          player,
          state,
          selection.lineStart,
        );
        const end = ends.find((u) => u.placement.coordinate === coordinate);
        if (end === undefined) {
          return { selection };
        }
        const lineStart = selection.lineStart;
        const segment = getLineSegmentFromStart(command, state, lineStart);
        const startIndex = segment.findIndex(
          (uwp) => isSameUnitInstance(uwp.unit, lineStart.unit).result,
        );
        const endIndex = segment.findIndex(
          (uwp) => isSameUnitInstance(uwp.unit, end.unit).result,
        );
        if (startIndex === -1 || endIndex === -1) {
          return { selection };
        }
        const low = Math.min(startIndex, endIndex);
        const high = Math.max(startIndex, endIndex);
        return {
          selection: {
            ...selection,
            selected: segment.slice(low, high + 1),
            legalUnitCoordinates: ends.map((u) => u.placement.coordinate),
          },
        };
      }

      const legal = getLegalUnitsForIssueCommand(command, player, state);
      const hit = legal.find((u) => u.placement.coordinate === coordinate);
      if (hit === undefined) {
        return { selection };
      }
      const already = selection.selected.some(
        (u) => unitKey(u.unit) === unitKey(hit.unit),
      );
      const selected = already
        ? selection.selected.filter(
            (u) => unitKey(u.unit) !== unitKey(hit.unit),
          )
        : [...selection.selected, hit];
      return {
        selection: {
          ...selection,
          selected,
        },
      };
    }
    default: {
      return { selection };
    }
  }
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
    selected: [],
    lineStart: undefined,
    legalUnitCoordinates: legal.map((u) => u.placement.coordinate),
  };
}

export function canConfirmIssueCommand(selection: SeatSelection): boolean {
  if (selection.kind !== 'issueCommand' || selection.command === undefined) {
    return false;
  }
  if (selection.command.size === 'units') {
    return selection.selected.length === selection.command.number;
  }
  // Lines: segment chosen (includes single-unit line).
  return selection.selected.length > 0 && selection.lineStart !== undefined;
}

export function buildIssueCommandSubmit(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
): PlayerChoiceEvent | undefined {
  if (
    options.choiceType !== 'issueCommand' ||
    selection.kind !== 'issueCommand' ||
    selection.command === undefined ||
    !canConfirmIssueCommand(selection)
  ) {
    return undefined;
  }
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'issueCommand',
    eventNumber: options.expectedEventNumber,
    player: options.issueCommands.player,
    command: selection.command,
    units: selection.selected.map((entry) => entry.unit),
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
      selection: { kind: 'routDiscard', selectedCardIds: selected },
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

/** Whether the staged seat selection has something to undo. */
export function hasStagedUndo(selection: SeatSelection): boolean {
  switch (selection.kind) {
    case 'setup': {
      return selection.placements.length > 0;
    }
    case 'issueCommand': {
      return (
        selection.selected.length > 0 ||
        selection.lineStart !== undefined ||
        selection.command !== undefined
      );
    }
    case 'moveUnit': {
      return selection.unit !== undefined;
    }
    case 'routDiscard': {
      return selection.selectedCardIds.length > 0;
    }
    default: {
      return false;
    }
  }
}

/**
 * Undo one stage of the current choice draft (last setup placement, issue
 * picks, move-unit target, etc.). Does not touch server state.
 */
export function undoStagedSelection(
  selection: SeatSelection,
  options: LegalPlayerChoiceOptions | null,
  state: GameState | undefined,
): SeatSelection {
  if (options === null) {
    return selection;
  }

  switch (selection.kind) {
    case 'setup': {
      if (
        options.choiceType !== 'setupUnits' ||
        selection.placements.length === 0
      ) {
        return selection;
      }
      const placements = selection.placements.slice(0, -1);
      const remaining = options.setupUnits.units.filter(
        (unit) => !placements.some((p) => unitKey(p.unit) === unitKey(unit)),
      );
      return {
        kind: 'setup',
        selectedUnit: remaining.find(() => true),
        placements,
        awaitingCommander: false,
        commanderCoordinate: undefined,
      };
    }
    case 'issueCommand': {
      if (options.choiceType !== 'issueCommand' || state === undefined) {
        return selectionForOptions(options);
      }
      if (selection.selected.length > 0 || selection.lineStart !== undefined) {
        if (selection.command === undefined) {
          return selectionForOptions(options);
        }
        return selectIssueCommand(options, selection.command, state);
      }
      return selectionForOptions(options);
    }
    case 'moveUnit': {
      return { kind: 'moveUnit', unit: undefined, destinations: [] };
    }
    case 'routDiscard': {
      return { kind: 'routDiscard', selectedCardIds: [] };
    }
    default: {
      return selection;
    }
  }
}

/** Drop the draft and rebuild the default selection for the current options. */
export function resetStagedSelection(
  options: LegalPlayerChoiceOptions | null,
  state?: GameState,
): SeatSelection {
  if (options === null) {
    return emptySelection();
  }
  // Reset issue-command to a fresh draft (auto-pick when only one remains).
  if (options.choiceType === 'issueCommand' && state !== undefined) {
    const commands = options.issueCommands.commands;
    if (commands.length === 1) {
      const only = commands[0];
      if (only !== undefined) {
        return selectIssueCommand(options, only, state);
      }
    }
    return {
      kind: 'issueCommand',
      command: undefined,
      selected: [],
      lineStart: undefined,
      legalUnitCoordinates: [],
    };
  }
  return selectionForOptions(options);
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
    label: formatCommandLabel(command),
  }));
}
