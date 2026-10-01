import {
  getBoardSpace,
  getMeleeResolutionState,
  hasEngagedUnits,
  hasSingleUnit,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Board,
  Commitment,
  Coordinate,
  GameState,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';

type CommitmentStatusView =
  | { kind: 'pending' }
  | { kind: 'declined' }
  | { kind: 'completed'; cardLabel: string };

interface CombatUnitLabel {
  name: string;
  playerSide: PlayerSide;
}

interface CombatContextView {
  kind: 'melee';
  location: Coordinate;
  units: CombatUnitLabel[];
  whiteCommitment: CommitmentStatusView;
  blackCommitment: CommitmentStatusView;
}

const commitmentStatus = (commitment: Commitment): CommitmentStatusView => {
  if (commitment.commitmentType === 'pending') {
    return { kind: 'pending' };
  }
  if (commitment.commitmentType === 'declined') {
    return { kind: 'declined' };
  }
  if (commitment.card === 'hidden') {
    return { kind: 'completed', cardLabel: 'Hidden' };
  }
  return { kind: 'completed', cardLabel: commitment.card.name };
};

/**
 * Labels for units occupying a board space (single or engaged pair).
 */
function unitLabelsAtCoordinate(
  board: Board | undefined,
  coordinate: Coordinate,
): CombatUnitLabel[] {
  if (board === undefined) {
    return [];
  }
  try {
    const space = getBoardSpace(board, coordinate);
    const presence = space.unitPresence;
    if (hasSingleUnit(presence)) {
      return [
        {
          name: presence.unit.unitType.name,
          playerSide: presence.unit.playerSide,
        },
      ];
    }
    if (hasEngagedUnits(presence)) {
      return [
        {
          name: presence.primaryUnit.unitType.name,
          playerSide: presence.primaryUnit.playerSide,
        },
        {
          name: presence.secondaryUnit.unitType.name,
          playerSide: presence.secondaryUnit.playerSide,
        },
      ];
    }
  } catch {
    return [];
  }
  return [];
}

function engagementLabelAtCoordinate(
  board: Board | undefined,
  coordinate: Coordinate,
): string {
  const units = unitLabelsAtCoordinate(board, coordinate);
  if (units.length === 0) {
    return `Resolve ${coordinate}`;
  }
  if (units.length === 1) {
    return `${units[0].name} at ${coordinate}`;
  }
  return `${units[0].name} vs ${units[1].name} (${coordinate})`;
}

/**
 * Active melee resolution context for the rail (location, units, commitments).
 * Undefined outside resolveMelee, including when no game state has arrived.
 */
function combatContextFromState(
  state?: GameState,
): CombatContextView | undefined {
  // Nothing ingested yet, so there is no engagement to describe.
  if (state === undefined) {
    return undefined;
  }
  try {
    const melee = getMeleeResolutionState(state);
    return {
      kind: 'melee',
      location: melee.location,
      units: unitLabelsAtCoordinate(state.boardState, melee.location),
      whiteCommitment: commitmentStatus(melee.whiteCommitment),
      blackCommitment: commitmentStatus(melee.blackCommitment),
    };
  } catch {
    // getMeleeResolutionState throws when the phase is not resolveMelee.
    return undefined;
  }
}

function formatCombatEngagementLine(context: CombatContextView): string {
  const units = context.units;
  if (units.length >= 2) {
    return `${units[0].name} vs ${units[1].name} at ${context.location}`;
  }
  if (units.length === 1) {
    return `${units[0].name} at ${context.location}`;
  }
  return `Melee at ${context.location}`;
}

function formatCommitmentStatus(status: CommitmentStatusView): string {
  if (status.kind === 'pending') {
    return 'Pending';
  }
  if (status.kind === 'declined') {
    return 'Declined';
  }
  return status.cardLabel;
}

export {
  type CommitmentStatusView,
  type CombatUnitLabel,
  type CombatContextView,
  unitLabelsAtCoordinate,
  engagementLabelAtCoordinate,
  combatContextFromState,
  formatCombatEngagementLine,
  formatCommitmentStatus,
};
