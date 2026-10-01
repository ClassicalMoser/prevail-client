import type {
  LegalPlayerChoiceOptions,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';

/** True when this legal choice includes the human seat. Absence is handled by the caller. */
export const isHumanTurn = (
  options: LegalPlayerChoiceOptions,
  humanSide: PlayerSide,
): boolean => {
  const source = options.playerSource;
  return source === humanSide || source === 'bothPlayers';
};
