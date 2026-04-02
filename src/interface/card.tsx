import type { Card } from "@classicalmoser/prevail-rules/domain";
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

  //
  return (
    <div class="card-component" data-card-id={id}>
      <div class="card-component-inner">
        <h1 class="card-component-initiative">{initiative}</h1>
        <h2 class="card-component-name">{name}</h2>
        <div class="card-component-commit-modifiers">
          <h3>Commit Modifiers</h3>
          {commitModifiers.map((modifier) => (
            <div class="card-component-modifier-row">
              <p>{modifier.type}</p>
              <p>{modifier.value}</p>
            </div>
          ))}
        </div>
        <div class="card-component-command">
          <h3>
            <strong>
              {`Perform ${commandType === "movement" ? "Movement" : "Ranged Attack"}`}
            </strong>
          </h3>
          <h4>
            With {commandNumber} {commandSize}
          </h4>
          <h4>Restrictions</h4>
          {commandRestrictions.inspirationRangeRestriction !== undefined ? (
            <p>
              Inspiration: {commandRestrictions.inspirationRangeRestriction}
            </p>
          ) : null}
          {commandRestrictions.unitRestrictions.length > 0 ? (
            <p>Units: {commandRestrictions.unitRestrictions.join(", ")}</p>
          ) : null}
          {commandRestrictions.traitRestrictions.length > 0 ? (
            <p>Traits: {commandRestrictions.traitRestrictions.join(", ")}</p>
          ) : null}
          {commandModifiers.length > 0 ? (
            <p>
              Command Modifiers:{" "}
              {commandModifiers
                .map((modifier) => `${modifier.type}: ${modifier.value}`)
                .join(", ")}
            </p>
          ) : null}
          {roundEffectModifiers !== undefined &&
          roundEffectModifiers.length > 0 ? (
            <div class="card-component-round-effect-modifiers">
              <h4>Round Effect Modifiers</h4>
              <p>
                {roundEffectModifiers
                  .map((modifier) => `${modifier.type}: ${modifier.value}`)
                  .join(", ")}
              </p>
            </div>
          ) : null}
          {roundEffectRestrictions !== undefined ? (
            <div class="card-component-round-effect-restrictions">
              <h4>Round Effect Restrictions</h4>
              {roundEffectRestrictions.inspirationRangeRestriction !==
              undefined ? (
                <p>
                  Inspiration:{" "}
                  {roundEffectRestrictions.inspirationRangeRestriction}
                </p>
              ) : null}
              {roundEffectRestrictions.unitRestrictions.length > 0 ? (
                <p>
                  Units: {roundEffectRestrictions.unitRestrictions.join(", ")}
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
          <h3>Unit Preservation</h3>
          <p>{unitPreservation.join(", ")}</p>
        </div>
      </div>
    </div>
  );
};
