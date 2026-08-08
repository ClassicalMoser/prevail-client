import type {
  Board,
  Commitment,
  Coordinate,
  GameState,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import {
  getBoardSpace,
  getMeleeResolutionState,
  hasEngagedUnits,
  hasSingleUnit,
} from '@classicalmoser/prevail-rules/domain';

export type CommitmentStatusView =
  | { kind: 'pending' }
  | { kind: 'declined' }
  | { kind: 'completed'; cardLabel: string };

export interface CombatUnitLabel {
  name: string;
  playerSide: PlayerSide;
}

export interface CombatContextView {
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
export function unitLabelsAtCoordinate(
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

export function engagementLabelAtCoordinate(
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
 */
export function combatContextFromState(
  state?: GameState,
): CombatContextView | null {
  if (state === undefined) {
    return null;
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
    return null;
  }
}

export function formatCombatEngagementLine(context: CombatContextView): string {
  const units = context.units;
  if (units.length >= 2) {
    return `${units[0].name} vs ${units[1].name} at ${context.location}`;
  }
  if (units.length === 1) {
    return `${units[0].name} at ${context.location}`;
  }
  return `Melee at ${context.location}`;
}

export function formatCommitmentStatus(status: CommitmentStatusView): string {
  if (status.kind === 'pending') {
    return 'Pending';
  }
  if (status.kind === 'declined') {
    return 'Declined';
  }
  return status.cardLabel;
}
