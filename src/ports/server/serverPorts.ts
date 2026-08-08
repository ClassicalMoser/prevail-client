import type { Armies } from './armies';
import type { CommandCards } from './commandCards';
import type { UnitCards } from './unitCards';

/** All outbound ports required to talk to the Prevail server. */
export interface ServerPorts {
  armies: Armies;
  commandCards: CommandCards;
  unitCards: UnitCards;
}
