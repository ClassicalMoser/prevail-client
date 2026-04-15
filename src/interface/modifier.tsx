import type { Modifier } from "@classicalmoser/prevail-rules/domain";
import type { JSX } from "solid-js";
import AttackIcon from "../assets/icons/attackIcon.svg";
import FlexibilityIcon from "../assets/icons/flexibilityIcon.svg";
import RangeIcon from "../assets/icons/rangedIcon.svg";
import "./modifier.css";

export const ModifierComponent = (props: { modifier: Modifier }) => {
  const modifierType = props.modifier.type;
  const modifierValue = props.modifier.value;
  const zeroModifier = modifierValue === 0;
  const modifierPositive = modifierValue > 0;
  const modifierNumber = Math.abs(modifierValue);
  const displaySign = modifierPositive ? "+" : "-";
  const getDisplayIcon = (): string | null => {
    switch (modifierType) {
      case "attack":
        return AttackIcon;
      case "range":
        return RangeIcon;
      case "flexibility":
        return FlexibilityIcon;
      default:
        return null;
    }
  };

  const displayIcon = getDisplayIcon();

  const makeDisplayArray = (): JSX.Element[] => {
    const displayArray: JSX.Element[] = [];
    for (let i = 0; i < modifierNumber; i++) {
      displayArray.push(
        displayIcon != null ? (
          <img src={displayIcon} alt={modifierType} class="modifier-icon" />
        ) : (
          <p>{modifierType}</p>
        ),
      );
    }
    return displayArray;
  };

  return !zeroModifier ? (
    <div class="modifier-component">
      {displaySign}
      {makeDisplayArray().map((display) => (
        <p>{display}</p>
      ))}
    </div>
  ) : null;
};
