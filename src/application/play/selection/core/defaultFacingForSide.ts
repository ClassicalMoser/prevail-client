import type {
  PlayerSide,
  UnitFacing,
} from '@classicalmoser/prevail-rules/domain';

/** Default facing into the board from each side's setup belt. */
export const defaultFacingForSide = (side: PlayerSide): UnitFacing =>
  side === 'white' ? 'south' : 'north';
