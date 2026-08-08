import type {
  Coordinate,
  UnitFacing,
} from '@classicalmoser/prevail-rules/domain';
import { handleCellClick, handleFacingClick } from '../selection';
import type { SeatPlayActionsDeps } from './types';
import { unlockDraft } from './unlockDraft';

export function createBoardActions(deps: SeatPlayActionsDeps): {
  onCellClick: (coordinate: string) => void;
  onFacingClick: (coordinate: string, facing: UnitFacing) => void;
} {
  return {
    onCellClick: (coordinate) => {
      unlockDraft(deps);
      const state = deps.readGameState();
      if (state === undefined) {
        return;
      }
      const result = handleCellClick({
        coordinate: coordinate as Coordinate,
        options: deps.legalOptions(),
        selection: deps.selection(),
        state,
      });
      deps.setSelection(result.selection);
      if (result.submit !== undefined) {
        deps.submit(result.submit);
      }
    },
    onFacingClick: (coordinate, facing) => {
      unlockDraft(deps);
      const result = handleFacingClick({
        coordinate: coordinate as Coordinate,
        facing,
        options: deps.legalOptions(),
        selection: deps.selection(),
      });
      deps.setSelection(result.selection);
      if (result.submit !== undefined) {
        deps.submit(result.submit);
      }
    },
  };
}
