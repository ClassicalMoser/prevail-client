import type { UnitFacing } from '@classicalmoser/prevail-rules/domain';
import { unitFacings } from '@classicalmoser/prevail-rules/domain';
import { cx } from './lib';
import type { JSX } from 'solid-js';
import { createMemo, For, mergeProps } from 'solid-js';
import './facing-arrow-pad.css';

const FACING_GLYPH: Record<UnitFacing, string> = {
  north: '↑',
  northEast: '↗',
  east: '→',
  southEast: '↘',
  south: '↓',
  southWest: '↙',
  west: '←',
  northWest: '↖',
};

/** CSS grid cell (1-based) for each facing in a 3×3 pad (center empty). */
const FACING_GRID_AREA: Record<UnitFacing, string> = {
  northWest: '1 / 1',
  north: '1 / 2',
  northEast: '1 / 3',
  west: '2 / 1',
  east: '2 / 3',
  southWest: '3 / 1',
  south: '3 / 2',
  southEast: '3 / 3',
};

export interface FacingArrowPadProps {
  /**
   * Facings that can be chosen. Only these arrows are rendered.
   * Omit or pass all eight when every facing is legal (e.g. setup).
   * Pass `[]` to render nothing.
   */
  enabledFacings?: readonly UnitFacing[];
  /** Optional highlight for the currently chosen facing. */
  selectedFacing?: UnitFacing;
  disabled?: boolean;
  class?: string;
  onSelectFacing: (facing: UnitFacing) => void;
}

/**
 * Facing control laid out as a 3×3 pad (center empty).
 * Renders only the enabled facing arrows — illegal directions are omitted.
 */
export const FacingArrowPad = (rawProps: FacingArrowPadProps): JSX.Element => {
  const props = mergeProps(
    { disabled: false, enabledFacings: unitFacings },
    rawProps,
  );

  const facings = createMemo((): UnitFacing[] => [...props.enabledFacings]);

  return (
    <fieldset
      class={cx('facing-arrow-pad', props.class)}
      aria-label="Choose facing"
    >
      <For each={facings()}>
        {(facing) => {
          const isSelected = () => props.selectedFacing === facing;
          return (
            <button
              type="button"
              class={cx(
                'facing-arrow-pad__btn',
                isSelected() && 'facing-arrow-pad__btn--selected',
              )}
              style={{ 'grid-area': FACING_GRID_AREA[facing] }}
              disabled={props.disabled}
              aria-label={`Face ${facing}`}
              aria-pressed={isSelected()}
              onClick={(event) => {
                event.stopPropagation();
                if (props.disabled) {
                  return;
                }
                props.onSelectFacing(facing);
              }}
            >
              <span aria-hidden="true">{FACING_GLYPH[facing]}</span>
            </button>
          );
        }}
      </For>
    </fieldset>
  );
};
