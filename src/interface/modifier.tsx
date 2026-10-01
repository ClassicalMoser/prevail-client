import type { Modifier } from '@classicalmoser/prevail-rules/domain';
import { createMemo, For, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import AttackIcon from '../assets/icons/Attack Icon.svg';
import FlexibilityIcon from '../assets/icons/Flexibility Icon.svg';
import RangeIcon from '../assets/icons/Ranged Icon.svg';
import './modifier.css';

/** Icon for modifier types that have one. Other stats render their type name. */
function iconSrcForModifierType(
  modifierType: Modifier['type'],
): string | undefined {
  switch (modifierType) {
    case 'attack': {
      return AttackIcon;
    }
    case 'range': {
      return RangeIcon;
    }
    case 'flexibility': {
      return FlexibilityIcon;
    }
    default: {
      return undefined;
    }
  }
}

export const ModifierComponent = (props: {
  modifier: Modifier;
}): JSX.Element => {
  const display = createMemo(() => {
    const modifierType = props.modifier.type;
    const modifierValue = props.modifier.value;
    const modifierPositive = modifierValue > 0;
    const displaySign = modifierPositive ? '+' : '-';
    const displayIcon = iconSrcForModifierType(modifierType);

    return {
      modifierType,
      modifierValue,
      modifierPositive,
      displaySign,
      displayIcon,
    };
  });

  return (
    <Show when={display().modifierValue !== 0}>
      <div class="modifier-component">
        {display().displaySign}
        <For each={Array.from({ length: Math.abs(display().modifierValue) })}>
          {() =>
            display().displayIcon !== undefined ? (
              <img
                src={display().displayIcon}
                alt={display().modifierType}
                class="modifier-icon"
              />
            ) : (
              <p>{display().modifierType}</p>
            )
          }
        </For>
      </div>
    </Show>
  );
};
