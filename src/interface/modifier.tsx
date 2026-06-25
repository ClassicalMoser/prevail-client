import type { Modifier } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import { createMemo, For, Show } from 'solid-js';
import AttackIcon from '../assets/icons/Attack Icon.svg';
import FlexibilityIcon from '../assets/icons/Flexibility Icon.svg';
import RangeIcon from '../assets/icons/Ranged Icon.svg';
import './modifier.css';

export const ModifierComponent = (props: {
  modifier: Modifier;
}): JSX.Element => {
  const display = createMemo(() => {
    const modifierType = props.modifier.type;
    const modifierValue = props.modifier.value;
    const modifierPositive = modifierValue > 0;
    const displaySign = modifierPositive ? '+' : '-';
    const displayIcon = ((): string | null => {
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
          return null;
        }
      }
    })();

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
            display().displayIcon !== null ? (
              <img
                src={display().displayIcon ?? undefined}
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
