import type { UnitSupport } from '@classicalmoser/prevail-rules/domain';

/** Identity of a summed support category. Count is a budget, not part of the kind. */
export function supportKind(unitSupport: UnitSupport): string {
  switch (unitSupport.supportType) {
    case 'generic': {
      return 'generic';
    }
    case 'trait': {
      return `trait:${unitSupport.trait}`;
    }
    case 'unitType': {
      return `unitType:${unitSupport.unitTypeId}`;
    }
    default: {
      const _exhaustive: never = unitSupport;
      return _exhaustive;
    }
  }
}
