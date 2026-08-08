import type {
  Board,
  PlayerSide,
  UnitFacing,
} from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
import singleTile from '../assets/singleTile.png';
import { AnchoredPublishedCardPreview } from './components';
import { FacingArrowPad } from './facing-arrow-pad';
import { UnitComponent } from './unit';
import './board.css';

/** Presentational unit chip projected from authoritative board state. */
export interface BoardUnitViewProps {
  label: string;
  facing: UnitFacing;
  imageSrc: string | undefined;
  /** Local pending placement (not yet committed on the server). */
  pending?: boolean;
  unitTypeId?: string;
  unitTypeVersion?: string;
  unitTypeName?: string;
}

/** Presentational cell content projected from authoritative board state. */
export interface BoardCellViewProps {
  commanders: PlayerSide[];
  units: BoardUnitViewProps[];
  highlight?: 'legal' | 'selected';
  /** Show reusable eight-direction facing arrows for this cell. */
  facingPicker?: boolean;
  /** Facings enabled on the picker; omit for all eight. */
  enabledFacings?: readonly UnitFacing[];
}

interface UnitHoverPreview {
  id: string;
  version: string;
  name: string;
  rect: DOMRect;
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

function cellHighlightClass(
  highlight: 'legal' | 'selected' | undefined,
): string {
  if (highlight === 'legal') {
    return 'board-cell--legal';
  }
  if (highlight === 'selected') {
    return 'board-cell--selected';
  }
  return '';
}

const BoardCellBody = (props: {
  cell: string;
  view: Accessor<BoardCellViewProps | undefined>;
  onFacingClick?: (coordinate: string, facing: UnitFacing) => void;
  onUnitHoverStart?: (unit: BoardUnitViewProps, el: HTMLElement) => void;
  onUnitHoverEnd?: () => void;
}): JSX.Element => (
  <>
    <img src={singleTile} alt="" />
    <Show when={props.view()}>
      {(view) => (
        <>
          <Show when={view().commanders.length > 0}>
            <span class="board-cell-commanders bg-background/75 text-foreground absolute top-0.5 right-0.5 left-0.5 z-110 text-center text-xs leading-tight">
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
                pending={unit.pending}
                onHoverStart={(el) => {
                  props.onUnitHoverStart?.(unit, el);
                }}
                onHoverEnd={() => {
                  props.onUnitHoverEnd?.();
                }}
              />
            )}
          </For>
          <Show when={view().facingPicker === true}>
            <FacingArrowPad
              // Fail closed: missing list → no arrows (never invent all eight).
              enabledFacings={view().enabledFacings ?? []}
              onSelectFacing={(facing) => {
                props.onFacingClick?.(props.cell, facing);
              }}
            />
          </Show>
        </>
      )}
    </Show>
  </>
);

export const BoardComponent = (props: {
  board: Accessor<Board | undefined>;
  cells: Accessor<Readonly<Partial<Record<string, BoardCellViewProps>>>>;
  onCellClick?: (coordinate: string) => void;
  onFacingClick?: (coordinate: string, facing: UnitFacing) => void;
}): JSX.Element => {
  const [unitHover, setUnitHover] = createSignal<
    UnitHoverPreview | undefined
  >();
  let dismissHoverListeners: (() => void) | undefined;

  const clearUnitHover = (): void => {
    setUnitHover(undefined);
    dismissHoverListeners?.();
    dismissHoverListeners = undefined;
  };

  const showUnitHover = (unit: BoardUnitViewProps, el: HTMLElement): void => {
    if (
      unit.unitTypeId === undefined ||
      unit.unitTypeVersion === undefined ||
      unit.unitTypeName === undefined
    ) {
      clearUnitHover();
      return;
    }
    clearUnitHover();
    setUnitHover({
      id: unit.unitTypeId,
      version: unit.unitTypeVersion,
      name: unit.unitTypeName,
      rect: el.getBoundingClientRect(),
    });
    const dismiss = (): void => {
      clearUnitHover();
    };
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    dismissHoverListeners = () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  };

  onCleanup(clearUnitHover);

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
  const hoverAnchor = (): DOMRect | undefined => unitHover()?.rect;
  const hoverCard = (): UnitHoverPreview | undefined => unitHover();

  return (
    <Show when={props.board()}>
      {(_board) => (
        <>
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
                        const cellClass = () =>
                          `board-cell ${cellHighlightClass(cellView()?.highlight)} ${cellView()?.facingPicker === true ? 'board-cell--facing' : ''}`;
                        return (
                          <Show
                            when={cellView()?.facingPicker === true}
                            fallback={
                              <button
                                type="button"
                                class={cellClass()}
                                aria-label={cell}
                                onClick={() => props.onCellClick?.(cell)}
                              >
                                <BoardCellBody
                                  cell={cell}
                                  view={cellView}
                                  onFacingClick={props.onFacingClick}
                                  onUnitHoverStart={showUnitHover}
                                  onUnitHoverEnd={clearUnitHover}
                                />
                              </button>
                            }
                          >
                            {/* Nested facing buttons cannot live inside a <button>. */}
                            <div class={cellClass()} aria-label={cell}>
                              <BoardCellBody
                                cell={cell}
                                view={cellView}
                                onFacingClick={props.onFacingClick}
                                onUnitHoverStart={showUnitHover}
                                onUnitHoverEnd={clearUnitHover}
                              />
                            </div>
                          </Show>
                        );
                      }}
                    </For>
                  </div>
                )}
              </For>
            </div>
          </div>
          <Show when={hoverCard()}>
            {(card) => (
              <AnchoredPublishedCardPreview
                kind="unit"
                id={card().id}
                version={card().version}
                name={card().name}
                anchor={hoverAnchor}
              />
            )}
          </Show>
        </>
      )}
    </Show>
  );
};
