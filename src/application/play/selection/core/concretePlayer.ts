import type {
  GameState,
  LegalPlayerChoiceOptions,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';

export const concretePlayer = (
  options: LegalPlayerChoiceOptions,
  state: GameState,
): PlayerSide =>
  options.playerSource === 'bothPlayers'
    ? state.currentInitiative
    : options.playerSource;
