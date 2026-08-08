import type {
  LegalPlayerChoiceOptions,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';

export const isHumanTurn = (
  options: LegalPlayerChoiceOptions | null,
  humanSide: PlayerSide,
): boolean => {
  if (options === null) {
    return false;
  }
  const source = options.playerSource;
  return source === humanSide || source === 'bothPlayers';
};
