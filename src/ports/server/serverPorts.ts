import type { Armies } from './armies';
import type { GameSeat } from './gameSeat';
import type { Games } from './games';
import type { CommandCards } from './commandCards';
import type { UnitCards } from './unitCards';

/** All outbound ports required to talk to the Prevail server. */
export interface ServerPorts {
  armies: Armies;
  games: Games;
  gameSeat: GameSeat;
  commandCards: CommandCards;
  unitCards: UnitCards;
}
