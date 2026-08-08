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
  getBoardSpace,
  getLegalLineEndsForIssueCommand,
  getLegalPlayerChoiceOptions,
  getLegalRangedAttackSupporters,
  getLegalRangedAttackTargets,
  getLegalUnitMoves,
  getLegalUnitsForIssueCommand,
  getLineSegmentFromStart,
  getOwnedPlayerCardState,
  getPositionOfUnit,
  hasSingleUnit,
  isSameUnitInstance,
  PLAYER_CHOICE_EVENT_TYPE,
  playerChoiceEventSchema,
  unitFacings,
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
      /** Destination hex awaiting facing arrow confirm. */
      pendingDestination: Coordinate | undefined;
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
      kind: 'performRangedAttack';
      attacker: UnitWithPlacement | undefined;
      target: UnitWithPlacement | undefined;
      supporters: UnitWithPlacement[];
      legalUnitCoordinates: Coordinate[];
    }
  | {
      kind: 'routDiscard';
      selectedCardIds: string[];
    }
  | {
      kind: 'assignUnitSupport';
      /** Hand card currently receiving unit toggles. */
      activeCardId: string | undefined;
      /** Per-card covered units (omit empty on submit). */
      assignments: { cardId: string; units: UnitInstance[] }[];
    };

export interface PlayHighlights {
  cells: Readonly<Partial<Record<string, CellHighlight>>>;
  /** Cells that should show the eight-direction facing picker. */
  facingPickerCells: ReadonlySet<string>;
  /** Allowed facings per picker cell (omit / empty = all eight). */
  facingPickerFacings: Readonly<
    Partial<Record<string, readonly UnitFacing[]>>
  >;
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
      return {
        kind: 'moveUnit',
        unit: undefined,
        destinations: [],
        pendingDestination: undefined,
      };
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
    case 'performRangedAttack': {
      return {
        kind: 'performRangedAttack',
        attacker: undefined,
        target: undefined,
        supporters: [],
        legalUnitCoordinates: options.rangedAttackers.attackers.map(
          (attacker) => attacker.placement.coordinate,
        ),
      };
    }
    case 'chooseRoutDiscard': {
      return { kind: 'routDiscard', selectedCardIds: [] };
    }
    case 'assignUnitSupport': {
      return {
        kind: 'assignUnitSupport',
        activeCardId: options.unitSupportGrants.grants[0]?.card.id,
        assignments: [],
      };
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

function facingsForCoordinate(
  destinations: UnitPlacement[],
  coordinate: Coordinate,
): UnitFacing[] {
  const seen = new Set<UnitFacing>();
  const facings: UnitFacing[] = [];
  for (const destination of destinations) {
    if (destination.coordinate !== coordinate || seen.has(destination.facing)) {
      continue;
    }
    seen.add(destination.facing);
    facings.push(destination.facing);
  }
  return facings;
}

function placementForCoordinateAndFacing(
  destinations: UnitPlacement[],
  coordinate: Coordinate,
  facing: UnitFacing,
): UnitPlacement | undefined {
  return destinations.find(
    (d) => d.coordinate === coordinate && d.facing === facing,
  );
}

/**
 * Contiguous start→end segment along flanking geometry. Order matters:
 * validators treat `units[0]` as the inspired start.
 */
export function lineUnitsFromStartToEnd(
  segment: readonly UnitWithPlacement[],
  start: UnitWithPlacement,
  end: UnitWithPlacement,
): UnitWithPlacement[] | undefined {
  const startIndex = segment.findIndex(
    (uwp) => isSameUnitInstance(uwp.unit, start.unit).result,
  );
  const endIndex = segment.findIndex(
    (uwp) => isSameUnitInstance(uwp.unit, end.unit).result,
  );
  if (startIndex === -1 || endIndex === -1) {
    return undefined;
  }
  if (startIndex <= endIndex) {
    return segment.slice(startIndex, endIndex + 1);
  }
  return segment.slice(endIndex, startIndex + 1).toReversed();
}

export function computeHighlights(
  options: LegalPlayerChoiceOptions | null,
  selection: SeatSelection,
  state?: GameState,
): PlayHighlights {
  const cells: Partial<Record<string, CellHighlight>> = {};
  const cardIds: Partial<Record<string, CellHighlight>> = {};
  const facingPickerCells = new Set<string>();
  const facingPickerFacings: Partial<Record<string, readonly UnitFacing[]>> =
    {};

  if (options === null) {
    return { cells, cardIds, facingPickerCells, facingPickerFacings };
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
          facingPickerFacings[coordinate] = unitFacings;
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
        const pending = selection.pendingDestination;
        if (pending !== undefined) {
          cells[pending] = 'selected';
          facingPickerCells.add(pending);
          facingPickerFacings[pending] = facingsForCoordinate(
            selection.destinations,
            pending,
          );
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
    case 'assignUnitSupport': {
      for (const grant of options.unitSupportGrants.grants) {
        cardIds[grant.card.id] =
          selection.kind === 'assignUnitSupport' &&
          selection.activeCardId === grant.card.id
            ? 'selected'
            : 'legal';
      }
      if (selection.kind === 'assignUnitSupport' && state !== undefined) {
        const covered = new Set(
          selection.assignments.flatMap((a) => a.units.map(unitKey)),
        );
        for (const assignment of selection.assignments) {
          for (const unit of assignment.units) {
            try {
              cells[getPositionOfUnit(state.boardState, unit).coordinate] =
                'selected';
            } catch {
              // Unit already off the board.
            }
          }
        }
        const activeGrant = options.unitSupportGrants.grants.find(
          (g) => g.card.id === selection.activeCardId,
        );
        if (activeGrant !== undefined) {
          for (const unit of activeGrant.eligibleUnits) {
            if (covered.has(unitKey(unit))) {
              continue;
            }
            try {
              cells[getPositionOfUnit(state.boardState, unit).coordinate] =
                'legal';
            } catch {
              // skip
            }
          }
        }
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
    case 'performRangedAttack': {
      if (selection.kind === 'performRangedAttack') {
        for (const coordinate of selection.legalUnitCoordinates) {
          cells[coordinate] = 'legal';
        }
        if (selection.attacker !== undefined) {
          cells[selection.attacker.placement.coordinate] = 'selected';
        }
        if (selection.target !== undefined) {
          cells[selection.target.placement.coordinate] = 'selected';
        }
        for (const supporter of selection.supporters) {
          cells[supporter.placement.coordinate] = 'selected';
        }
      }
      break;
    }
    default: {
      break;
    }
  }

  return { cells, cardIds, facingPickerCells, facingPickerFacings };
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
  if (options === null) {
    return { selection };
  }

  if (options.choiceType === 'setupUnits') {
    if (selection.kind !== 'setup') {
      return { selection };
    }
    return placeSetupUnit({ coordinate, facing, options, selection });
  }

  if (options.choiceType === 'moveUnit') {
    if (selection.kind !== 'moveUnit' || selection.unit === undefined) {
      return { selection };
    }
    if (selection.pendingDestination !== coordinate) {
      return { selection };
    }
    const to = placementForCoordinateAndFacing(
      selection.destinations,
      coordinate,
      facing,
    );
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
        unit: cloneDraft(selection.unit),
        to: cloneDraft(to),
        moveCommander: false,
      },
    };
  }

  return { selection };
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
      // Recover if the draft kind drifted from options (identity effect lag /
      // Undo edge). Highlights still render from options alone.
      const moveSelection: Extract<SeatSelection, { kind: 'moveUnit' }> =
        selection.kind === 'moveUnit'
          ? selection
          : {
              kind: 'moveUnit',
              unit: undefined,
              destinations: [],
              pendingDestination: undefined,
            };

      if (moveSelection.unit === undefined) {
        const unit = options.moveUnits.units.find(
          (u) => u.placement.coordinate === coordinate,
        );
        if (unit === undefined) {
          return { selection: moveSelection };
        }
        let destinations: UnitPlacement[] = [];
        try {
          // Plain clone — Solid store proxies can break engine equality checks.
          destinations = [...getLegalUnitMoves(cloneDraft(unit), state)];
        } catch (error) {
          console.error(error);
        }
        return {
          selection: {
            kind: 'moveUnit',
            unit,
            destinations,
            pendingDestination: undefined,
          },
        };
      }

      // Re-click selected unit to clear; click another legal unit to switch.
      const otherUnit = options.moveUnits.units.find(
        (u) => u.placement.coordinate === coordinate,
      );
      if (otherUnit !== undefined) {
        if (
          unitKey(otherUnit.unit) === unitKey(moveSelection.unit.unit)
        ) {
          return {
            selection: {
              kind: 'moveUnit',
              unit: undefined,
              destinations: [],
              pendingDestination: undefined,
            },
          };
        }
        let destinations: UnitPlacement[] = [];
        try {
          destinations = [...getLegalUnitMoves(cloneDraft(otherUnit), state)];
        } catch (error) {
          console.error(error);
        }
        return {
          selection: {
            kind: 'moveUnit',
            unit: otherUnit,
            destinations,
            pendingDestination: undefined,
          },
        };
      }

      if (placementForCoordinate(moveSelection.destinations, coordinate) === undefined) {
        return { selection: moveSelection };
      }

      // Re-click pending destination to clear facing picker; otherwise stage it.
      if (moveSelection.pendingDestination === coordinate) {
        return {
          selection: {
            ...moveSelection,
            pendingDestination: undefined,
          },
        };
      }

      return {
        selection: {
          ...moveSelection,
          pendingDestination: coordinate,
        },
      };
    }
    case 'assignUnitSupport': {
      return toggleAssignUnitSupportAtCoordinate({
        coordinate,
        options,
        selection,
        state,
      });
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
      // Recover drifted draft; auto-pick when only one remaining slot.
      let issueSelection: Extract<SeatSelection, { kind: 'issueCommand' }> =
        selection.kind === 'issueCommand'
          ? selection
          : {
              kind: 'issueCommand',
              command: undefined,
              selected: [],
              lineStart: undefined,
              legalUnitCoordinates: [],
            };

      if (issueSelection.command === undefined) {
        const commands = options.issueCommands.commands;
        if (commands.length === 1 && commands[0] !== undefined) {
          issueSelection = selectIssueCommand(
            options,
            commands[0],
            state,
          ) as Extract<SeatSelection, { kind: 'issueCommand' }>;
        } else {
          return { selection: issueSelection };
        }
      }

      const command = issueSelection.command;
      if (command === undefined) {
        return { selection: issueSelection };
      }
      const player = options.issueCommands.player;

      if (command.size === 'lines') {
        if (issueSelection.lineStart === undefined) {
          const starts = getLegalUnitsForIssueCommand(command, player, state);
          const start = starts.find(
            (u) => u.placement.coordinate === coordinate,
          );
          if (start === undefined) {
            return { selection: issueSelection };
          }
          const ends = getLegalLineEndsForIssueCommand(
            command,
            player,
            state,
            start,
          );
          return {
            selection: {
              ...issueSelection,
              lineStart: start,
              selected: [],
              legalUnitCoordinates: ends.map((u) => u.placement.coordinate),
            },
          };
        }

        const ends = getLegalLineEndsForIssueCommand(
          command,
          player,
          state,
          issueSelection.lineStart,
        );
        // Re-click start = single-unit line (start is always a legal end).
        if (issueSelection.lineStart.placement.coordinate === coordinate) {
          return {
            selection: {
              ...issueSelection,
              selected: [issueSelection.lineStart],
              legalUnitCoordinates: ends.map((u) => u.placement.coordinate),
            },
          };
        }

        const end = ends.find((u) => u.placement.coordinate === coordinate);
        if (end === undefined) {
          return { selection: issueSelection };
        }
        const lineStart = issueSelection.lineStart;
        const segment = getLineSegmentFromStart(command, state, lineStart);
        const selected = lineUnitsFromStartToEnd(segment, lineStart, end);
        if (selected === undefined) {
          return { selection: issueSelection };
        }
        return {
          selection: {
            ...issueSelection,
            selected,
            legalUnitCoordinates: ends.map((u) => u.placement.coordinate),
          },
        };
      }

      const legal = getLegalUnitsForIssueCommand(command, player, state);
      const hit = legal.find((u) => u.placement.coordinate === coordinate);
      if (hit === undefined) {
        return { selection: issueSelection };
      }
      const already = issueSelection.selected.some(
        (u) => unitKey(u.unit) === unitKey(hit.unit),
      );
      const selected = already
        ? issueSelection.selected.filter(
            (u) => unitKey(u.unit) !== unitKey(hit.unit),
          )
        : [...issueSelection.selected, hit];
      return {
        selection: {
          ...issueSelection,
          selected,
        },
      };
    }
    case 'performRangedAttack': {
      if (selection.kind !== 'performRangedAttack') {
        return { selection };
      }
      const { attackers } = options.rangedAttackers;

      if (selection.attacker === undefined) {
        const attacker = attackers.find(
          (candidate) => candidate.placement.coordinate === coordinate,
        );
        if (attacker === undefined) {
          return { selection };
        }
        const targets = getLegalRangedAttackTargets(attacker, state);
        return {
          selection: {
            kind: 'performRangedAttack',
            attacker,
            target: undefined,
            supporters: [],
            legalUnitCoordinates: targets.map((u) => u.placement.coordinate),
          },
        };
      }

      // Re-click attacker to clear and pick again.
      if (selection.attacker.placement.coordinate === coordinate) {
        return {
          selection: {
            kind: 'performRangedAttack',
            attacker: undefined,
            target: undefined,
            supporters: [],
            legalUnitCoordinates: attackers.map((u) => u.placement.coordinate),
          },
        };
      }

      if (selection.target === undefined) {
        const targets = getLegalRangedAttackTargets(selection.attacker, state);
        const target = targets.find(
          (candidate) => candidate.placement.coordinate === coordinate,
        );
        if (target === undefined) {
          return { selection };
        }
        const supporters = getLegalRangedAttackSupporters(
          selection.attacker,
          target,
          state,
        );
        return {
          selection: {
            kind: 'performRangedAttack',
            attacker: selection.attacker,
            target,
            supporters: [],
            // Keep alternate targets visible; supporters are optional toggles.
            legalUnitCoordinates: [
              ...targets.map((u) => u.placement.coordinate),
              ...supporters.map((u) => u.placement.coordinate),
            ],
          },
        };
      }

      // Target chosen: toggle supporters, or switch to another legal target.
      const targets = getLegalRangedAttackTargets(selection.attacker, state);
      const newTarget = targets.find(
        (candidate) => candidate.placement.coordinate === coordinate,
      );
      if (
        newTarget !== undefined &&
        newTarget.placement.coordinate !== selection.target.placement.coordinate
      ) {
        const nextSupporters = getLegalRangedAttackSupporters(
          selection.attacker,
          newTarget,
          state,
        );
        return {
          selection: {
            kind: 'performRangedAttack',
            attacker: selection.attacker,
            target: newTarget,
            supporters: [],
            legalUnitCoordinates: [
              ...targets.map((u) => u.placement.coordinate),
              ...nextSupporters.map((u) => u.placement.coordinate),
            ],
          },
        };
      }

      const supportersLegal = getLegalRangedAttackSupporters(
        selection.attacker,
        selection.target,
        state,
      );
      const supporterHit = supportersLegal.find(
        (candidate) => candidate.placement.coordinate === coordinate,
      );
      if (supporterHit === undefined) {
        return { selection };
      }
      const already = selection.supporters.some(
        (u) => unitKey(u.unit) === unitKey(supporterHit.unit),
      );
      const supporters = already
        ? selection.supporters.filter(
            (u) => unitKey(u.unit) !== unitKey(supporterHit.unit),
          )
        : [...selection.supporters, supporterHit];
      return {
        selection: {
          ...selection,
          supporters,
          legalUnitCoordinates: [
            ...targets.map((u) => u.placement.coordinate),
            ...supportersLegal.map((u) => u.placement.coordinate),
          ],
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

export function canConfirmPerformRangedAttack(
  selection: SeatSelection,
): boolean {
  return (
    selection.kind === 'performRangedAttack' &&
    selection.attacker !== undefined &&
    selection.target !== undefined
  );
}

export function buildPerformRangedAttackSubmit(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
): PlayerChoiceEvent | undefined {
  if (
    options.choiceType !== 'performRangedAttack' ||
    selection.kind !== 'performRangedAttack' ||
    selection.attacker === undefined ||
    selection.target === undefined ||
    !canConfirmPerformRangedAttack(selection)
  ) {
    return undefined;
  }
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'performRangedAttack',
    eventNumber: options.expectedEventNumber,
    player: options.rangedAttackers.player,
    unit: selection.attacker,
    targetUnit: selection.target,
    supportingUnits: selection.supporters,
  };
}

export function selectAssignUnitSupportCard(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
  cardId: string,
): SeatSelection {
  if (
    options.choiceType !== 'assignUnitSupport' ||
    selection.kind !== 'assignUnitSupport'
  ) {
    return selection;
  }
  if (!options.unitSupportGrants.grants.some((g) => g.card.id === cardId)) {
    return selection;
  }
  return { ...selection, activeCardId: cardId };
}

function toggleAssignUnitSupportAtCoordinate(args: {
  coordinate: Coordinate;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'assignUnitSupport' }>;
  selection: SeatSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, options, state } = args;
  const selection: Extract<SeatSelection, { kind: 'assignUnitSupport' }> =
    args.selection.kind === 'assignUnitSupport'
      ? args.selection
      : {
          kind: 'assignUnitSupport',
          activeCardId: options.unitSupportGrants.grants[0]?.card.id,
          assignments: [],
        };

  if (selection.activeCardId === undefined) {
    return { selection };
  }

  const grant = options.unitSupportGrants.grants.find(
    (g) => g.card.id === selection.activeCardId,
  );
  if (grant === undefined) {
    return { selection };
  }

  let spaceUnit: UnitInstance | undefined;
  try {
    const space = getBoardSpace(state.boardState, coordinate);
    if (
      hasSingleUnit(space.unitPresence) &&
      space.unitPresence.unit.playerSide === options.unitSupportGrants.player
    ) {
      spaceUnit = space.unitPresence.unit;
    }
  } catch {
    return { selection };
  }
  if (spaceUnit === undefined) {
    return { selection };
  }

  const eligible = grant.eligibleUnits.some((u) =>
    isSameUnitInstance(u, spaceUnit).result,
  );
  if (!eligible) {
    return { selection };
  }

  // Drop this unit from every card, then toggle onto the active card.
  const withoutUnit = selection.assignments
    .map((assignment) => ({
      cardId: assignment.cardId,
      units: assignment.units.filter(
        (u) => !isSameUnitInstance(u, spaceUnit).result,
      ),
    }))
    .filter((assignment) => assignment.units.length > 0);

  const active = withoutUnit.find((a) => a.cardId === selection.activeCardId);
  const wasOnActive =
    selection.assignments
      .find((a) => a.cardId === selection.activeCardId)
      ?.units.some((u) => isSameUnitInstance(u, spaceUnit).result) === true;

  if (wasOnActive) {
    return {
      selection: { ...selection, assignments: withoutUnit },
    };
  }

  const currentCount = active?.units.length ?? 0;
  if (currentCount >= grant.unitSupport.count) {
    return { selection };
  }

  const nextActive = {
    cardId: selection.activeCardId,
    units: [...(active?.units ?? []), spaceUnit],
  };
  const assignments = [
    ...withoutUnit.filter((a) => a.cardId !== selection.activeCardId),
    nextActive,
  ];
  return { selection: { ...selection, assignments } };
}

export function canConfirmAssignUnitSupport(selection: SeatSelection): boolean {
  return selection.kind === 'assignUnitSupport';
}

export function buildAssignUnitSupportSubmit(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
): PlayerChoiceEvent | undefined {
  if (
    options.choiceType !== 'assignUnitSupport' ||
    selection.kind !== 'assignUnitSupport' ||
    !canConfirmAssignUnitSupport(selection)
  ) {
    return undefined;
  }
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'assignUnitSupport',
    eventNumber: options.expectedEventNumber,
    player: options.unitSupportGrants.player,
    assignments: selection.assignments.filter((a) => a.units.length > 0),
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
    case 'performRangedAttack': {
      return (
        selection.attacker !== undefined ||
        selection.target !== undefined ||
        selection.supporters.length > 0
      );
    }
    case 'moveUnit': {
      return selection.unit !== undefined;
    }
    case 'routDiscard': {
      return selection.selectedCardIds.length > 0;
    }
    case 'assignUnitSupport': {
      return (
        selection.assignments.some((a) => a.units.length > 0) ||
        selection.activeCardId !== undefined
      );
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
    case 'performRangedAttack': {
      if (
        options.choiceType !== 'performRangedAttack' ||
        state === undefined
      ) {
        return selectionForOptions(options);
      }
      if (selection.target !== undefined || selection.supporters.length > 0) {
        // Back to attacker-chosen, picking a target again.
        if (selection.attacker === undefined) {
          return selectionForOptions(options);
        }
        const targets = getLegalRangedAttackTargets(selection.attacker, state);
        return {
          kind: 'performRangedAttack',
          attacker: selection.attacker,
          target: undefined,
          supporters: [],
          legalUnitCoordinates: targets.map((u) => u.placement.coordinate),
        };
      }
      if (selection.attacker !== undefined) {
        return selectionForOptions(options);
      }
      return selection;
    }
    case 'moveUnit': {
      if (selection.pendingDestination !== undefined) {
        return {
          ...selection,
          pendingDestination: undefined,
        };
      }
      return {
        kind: 'moveUnit',
        unit: undefined,
        destinations: [],
        pendingDestination: undefined,
      };
    }
    case 'routDiscard': {
      return { kind: 'routDiscard', selectedCardIds: [] };
    }
    case 'assignUnitSupport': {
      if (selection.assignments.some((a) => a.units.length > 0)) {
        // Pop the last unit from the last non-empty assignment.
        const assignments = selection.assignments.map((a) => ({
          cardId: a.cardId,
          units: [...a.units],
        }));
        for (let i = assignments.length - 1; i >= 0; i -= 1) {
          const entry = assignments[i];
          if (entry !== undefined && entry.units.length > 0) {
            entry.units = entry.units.slice(0, -1);
            break;
          }
        }
        return {
          ...selection,
          assignments: assignments.filter((a) => a.units.length > 0),
        };
      }
      return {
        kind: 'assignUnitSupport',
        activeCardId: undefined,
        assignments: [],
      };
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
