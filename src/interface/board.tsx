import type { Board, UnitFacing } from "@classicalmoser/prevail-rules/domain";
import type { Accessor } from "solid-js";
import { createMemo, For, Show } from "solid-js";
import singleTile from "../assets/singleTile.png";
import { UnitComponent } from "./unit";
import "./board.css";

/** Optional demo hooks supplied by the application layer (not imported from `@application` here). */
export interface BoardCellDemoProps {
  shouldShowUnit: () => boolean;
  randomFacing: () => UnitFacing;
  randomUnitImageSrc: () => string;
}

export const BoardComponent = (props: {
  board: Accessor<Board | undefined>;
  cellDemo?: BoardCellDemoProps;
}) => {
  const layout = createMemo(() => {
    const b = props.board();
    const boardMap = b?.board;
    if (!boardMap) {
      return { rows: [] as string[][], rowCount: 0, colCount: 0 };
    }
    const cellCoordinates = Object.keys(boardMap);

    const getCoordinateRow = (cellCoordinate: string) =>
      cellCoordinate.split("-")[0]!;
    const getCoordinateColumn = (cellCoordinate: string) =>
      cellCoordinate.split("-")[1]!;

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
      if (!last || getCoordinateRow(last[0]!) !== row) {
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
            "--board-cols": layout().colCount,
            "--board-rows": layout().rowCount,
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
                        <Show
                          when={
                            props.cellDemo && props.cellDemo.shouldShowUnit()
                          }
                        >
                          <UnitComponent
                            facing={props.cellDemo!.randomFacing()}
                            imageSrc={props.cellDemo!.randomUnitImageSrc()}
                          />
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
