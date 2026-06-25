import type { Board, UnitFacing } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { createMemo, For, Show } from 'solid-js';
import singleTile from '../assets/singleTile.png';
import { UnitComponent } from './unit';
import './board.css';

/** Optional demo hooks supplied by the application layer (not imported from `@application` here). */
export interface BoardCellDemoProps {
  shouldShowUnit: () => boolean;
  randomFacing: () => UnitFacing;
  randomUnitImageSrc: () => string;
}

function parseCellCoordinate(cellCoordinate: string): {
  row: string;
  column: string;
} {
  const [row, column] = cellCoordinate.split('-');
  if (row === undefined || column === undefined) {
    throw new Error(`Invalid cell coordinate: ${cellCoordinate}`);
  }

  return { row, column };
}

export const BoardComponent = (props: {
  board: Accessor<Board | undefined>;
  cellDemo?: BoardCellDemoProps;
}): JSX.Element => {
  const layout = createMemo(() => {
    const b = props.board();
    const boardMap = b?.board;
    if (!boardMap) {
      return { rows: [] as string[][], rowCount: 0, colCount: 0 };
    }
    const cellCoordinates = Object.keys(boardMap);

    const getCoordinateRow = (cellCoordinate: string) =>
      parseCellCoordinate(cellCoordinate).row;
    const getCoordinateColumn = (cellCoordinate: string) =>
      parseCellCoordinate(cellCoordinate).column;

    const sorted = cellCoordinates.toSorted((a, b) => {
      const rowA = getCoordinateRow(a);
      const rowB = getCoordinateRow(b);
      if (rowA !== rowB) {
        return rowA.localeCompare(rowB);
      }
      return Number(getCoordinateColumn(a)) - Number(getCoordinateColumn(b));
    });

    const rows = sorted.reduce<string[][]>((acc, coord) => {
      const row = getCoordinateRow(coord);
      const last = acc.at(-1);
      const firstInLast = last?.[0];
      if (
        last === undefined ||
        firstInLast === undefined ||
        getCoordinateRow(firstInLast) !== row
      ) {
        acc.push([coord]);
      } else {
        last.push(coord);
      }
      return acc;
    }, []);

    const rowCount = rows.length;
    const colCount = rows.reduce((max, row) => Math.max(max, row.length), 0);

    return { rows, rowCount, colCount };
  });

  const rows = createMemo(() => layout().rows);

  return (
    <Show when={props.board()}>
      {(_board) => (
        <div
          class="board-shell"
          style={{
            '--board-cols': layout().colCount,
            '--board-rows': layout().rowCount,
          }}
        >
          <h2 class="board-title">Board</h2>
          <div class="board-grid">
            <For each={rows()}>
              {(row) => (
                <div class="board-row">
                  <For each={row}>
                    {(cell) => (
                      <div class="board-cell">
                        <img src={singleTile} alt={cell} />
                        <Show when={props.cellDemo}>
                          {(cellDemo) => (
                            <Show when={cellDemo().shouldShowUnit()}>
                              <UnitComponent
                                facing={cellDemo().randomFacing()}
                                imageSrc={cellDemo().randomUnitImageSrc()}
                              />
                            </Show>
                          )}
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>
      )}
    </Show>
  );
};
