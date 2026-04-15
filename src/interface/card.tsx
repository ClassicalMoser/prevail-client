import type { Card } from "@classicalmoser/prevail-rules/domain";
import { tempUnits } from "@classicalmoser/prevail-rules/domain";
import { ModifierComponent } from "./modifier";
import "./card.css";

/** Dumb, non-reactive component that renders a card. */
export const CardComponent = (props: { card: Card }) => {
  // We can destructure safely since this component is not reactive.
  const card = props.card;
  const id = card.id;
  const name = card.name;
  const initiative = card.initiative;
  const commitModifiers = card.modifiers;
  const command = card.command;
  const roundEffect = card.roundEffect;

  const commandType = command.type;
  const commandSize = command.size;
  const commandNumber = command.number;
  const commandRestrictions = command.restrictions;
  const commandModifiers = command.modifiers;

  const roundEffectModifiers = roundEffect?.modifiers;
  const roundEffectRestrictions = roundEffect?.restrictions;

  const unitPreservation = card.unitPreservation;

  const getUnitNameFromId = (id: string): string => {
    const foundUnit = tempUnits.find((unit) => unit.id === id);
    return foundUnit?.name ?? id;
  };

  //
  return (
    <div class="card-component" data-card-id={id}>
      <h1 class="card-component-initiative">{initiative}</h1>
      <h2 class="card-component-name">{name}</h2>
      <div class="card-component-commit-modifiers">
        {commitModifiers.map((modifier) => (
          <ModifierComponent modifier={modifier} />
        ))}
      </div>
      <div class="card-component-command">
        <h3>
          <strong>
            {`Perform ${commandType === "movement" ? "Movement" : "Ranged Attack"}`}
          </strong>
        </h3>
        <p>
          <span>
            {"With "}
            {commandNumber} {commandSize}
          </span>
          {commandRestrictions.unitRestrictions.length > 0 ? (
            <span>
              {" of "}
              {commandRestrictions.unitRestrictions
                .map((id) => getUnitNameFromId(id))
                .join(" and ")}
            </span>
          ) : null}
          {commandRestrictions.traitRestrictions.length > 0 ? (
            <span>
              {" with traits: "}
              {commandRestrictions.traitRestrictions.join(", ")}
            </span>
          ) : null}
          {commandRestrictions.inspirationRangeRestriction !== undefined ? (
            <span>
              {" within range "}
              {commandRestrictions.inspirationRangeRestriction}
            </span>
          ) : null}
        </p>
        {commandModifiers.length > 0 ? (
          <div class="card-component-command-modifiers">
            {commandModifiers.map((modifier) => (
              <ModifierComponent modifier={modifier} />
            ))}
          </div>
        ) : null}
        <h3>
          <strong>Round Effect</strong>
        </h3>
        {roundEffectModifiers !== undefined &&
        roundEffectModifiers.length > 0 ? (
          <div class="card-component-round-effect-modifiers">
            <h4>Modifiers</h4>
            {roundEffectModifiers.map((modifier) => (
              <ModifierComponent modifier={modifier} />
            ))}
          </div>
        ) : null}
        {roundEffectRestrictions !== undefined ? (
          <div class="card-component-round-effect-restrictions">
            <h4>Restrictions</h4>
            {roundEffectRestrictions.inspirationRangeRestriction !==
            undefined ? (
              <p>
                Inspiration:{" "}
                {roundEffectRestrictions.inspirationRangeRestriction}
              </p>
            ) : null}
            {roundEffectRestrictions.unitRestrictions.length > 0 ? (
              <p>
                Units:{" "}
                {roundEffectRestrictions.unitRestrictions
                  .map((id) => getUnitNameFromId(id))
                  .join(", ")}
              </p>
            ) : null}
            {roundEffectRestrictions.traitRestrictions.length > 0 ? (
              <p>
                Traits: {roundEffectRestrictions.traitRestrictions.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div class="card-component-unit-preservation">
        <h3>
          <strong>Unit Preservation</strong>
        </h3>
        <p>{unitPreservation.map((id) => getUnitNameFromId(id)).join(", ")}</p>
      </div>
    </div>
  );
};
