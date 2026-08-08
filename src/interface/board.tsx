import type {
  Board,
  PlayerSide,
  UnitFacing,
} from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { createMemo, For, Show } from 'solid-js';
import singleTile from '../assets/singleTile.png';
import { UnitComponent } from './unit';
import './board.css';

/** Presentational unit chip projected from authoritative board state. */
export interface BoardUnitViewProps {
  label: string;
  facing: UnitFacing;
  imageSrc: string | undefined;
}

/** Presentational cell content projected from authoritative board state. */
export interface BoardCellViewProps {
  commanders: PlayerSide[];
  units: BoardUnitViewProps[];
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
  cells: Accessor<Readonly<Partial<Record<string, BoardCellViewProps>>>>;
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
          <h2 class="board-title" id="board-heading">
            Board
          </h2>
          <div class="board-grid" aria-labelledby="board-heading">
            <For each={rows()}>
              {(row) => (
                <div class="board-row">
                  <For each={row}>
                    {(cell) => {
                      const cellView = () => props.cells()[cell];
                      return (
                        <div class="board-cell" aria-label={cell}>
                          <img src={singleTile} alt="" />
                          <Show when={cellView()}>
                            {(view) => (
                              <>
                                <Show when={view().commanders.length > 0}>
                                  <span class="board-cell-commanders bg-background/75 text-foreground absolute top-0.5 right-0.5 left-0.5 z-[110] text-center text-[0.55rem] leading-tight">
                                    {view().commanders.join(', ')} commander
                                    {view().commanders.length > 1 ? 's' : ''}
                                  </span>
                                </Show>
                                <For each={view().units}>
                                  {(unit) => (
                                    <UnitComponent
                                      facing={unit.facing}
                                      imageSrc={unit.imageSrc}
                                      label={unit.label}
                                    />
                                  )}
                                </For>
                              </>
                            )}
                          </Show>
                        </div>
                      );
                    }}
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
