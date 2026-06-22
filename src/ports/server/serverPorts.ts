import type { CommandCards } from './commandCards';
import type { UnitCards } from './unitCards';

/** All outbound ports required to talk to the Prevail server. */
export interface ServerPorts {
  commandCards: CommandCards;
  unitCards: UnitCards;
}
