import type { ArmyWriteBody } from '@classicalmoser/prevail-contracts';
import type { Armies } from '@ports';
import {
  unwrapCreatedRouteResponsePromise,
  unwrapDeleteRouteResponsePromise,
  unwrapRouteResponsePromise,
} from '../http';
import type { ArmyResources } from '../resources';

/**
 * Port adapter: strips HTTP envelopes and surfaces plain domain types.
 * Commands stay command-shaped (id / void); queries return `Army`.
 */
export function createArmiesAdapter(resources: ArmyResources): Armies {
  return {
    list: () => unwrapRouteResponsePromise(resources.getOwnedArmies()),
    getById: (id) =>
      unwrapRouteResponsePromise(resources.getOwnedArmyById({ id })),
    create: () =>
      unwrapCreatedRouteResponsePromise(resources.createOwnedArmy()),
    update: async (id, body: ArmyWriteBody) => {
      await unwrapRouteResponsePromise(resources.updateOwnedArmy({ id }, body));
    },
    archive: (id) =>
      unwrapDeleteRouteResponsePromise(resources.archiveOwnedArmy({ id })),
  };
}
