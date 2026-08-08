import type {
  Command,
  Coordinate,
  UnitInstance,
  UnitPlacement,
  UnitWithPlacement,
} from '@classicalmoser/prevail-rules/domain';

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
