import type { Card } from "@classicalmoser/prevail-rules/domain";
import { tempUnits } from "@classicalmoser/prevail-rules/domain";
import type { JSX } from "solid-js";
import cardImage from "../assets/card-layouts/Command Card Layout.svg";
import attackIcon from "../assets/icons/Attack Icon.svg";
import { ModifierComponent } from "./modifier";

/** Dumb, non-reactive component that renders a card. */
export const CardComponent = (props: { card: Card }): JSX.Element => {
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
    <div class="container aspect-2.5/3.5 w-64 mx-auto p-4 rounded-md relative" data-card-id={id}>
      <img src={cardImage} alt={name} class="absolute top-0 left-0 w-full h-full object-contain" />
      <div class="absolute top-0 left-0 w-full h-full text-center">
        <h1 class="text-3xl text-center absolute top-4  left-4">{initiative}</h1>
        <h2 class="absolute top-0 right-0 py-2 px-4 font-display text-white text-center mb-4">
          {name}
        </h2>
        <div class="absolute top-19.5 left-4">
          {commitModifiers.map((modifier) => (
            <img src={attackIcon} alt={modifier.type} class="size-4" />
          ))}
        </div>
        <div class="absolute bottom-0 top-42 py-1 px-2 text-sm items-center flex flex-col text-white w-full gap-2">
          <div class="flex flex-row gap-2">
            <h3>
              <strong>{`${commandType === "movement" ? "Movement" : "Ranged Attack"}`}</strong>
            </h3>
            <p>
              {"With "}
              {commandNumber} {commandSize}
            </p>
          </div>
          <div class="flex flex-row justify-start w-full">
            {commandModifiers.length > 0 ? (
              <div class="card-component-command-modifiers">
                {commandModifiers.map((modifier) => (
                  <ModifierComponent modifier={modifier} />
                ))}
              </div>
            ) : null}
            <div class="flex flex-col">
              <p>
                {commandRestrictions.unitRestrictions.length > 0 ? (
                  <span>
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
              </p>
            </div>
            <div class="absolute text-black bottom-33 right-8">
              {commandRestrictions.inspirationRangeRestriction !== undefined ? (
                <span>{commandRestrictions.inspirationRangeRestriction}</span>
              ) : null}
            </div>
          </div>
          <div class="absolute bottom-0 left-0 h-26 items-center w-full">
            <h3 class="text-center">Round Effect</h3>
            <div class=" flex flex-row py-1 px-2 w-full">
              {roundEffectModifiers !== undefined && roundEffectModifiers.length > 0 ? (
                <div class="flex flex-col gap-1">
                  {roundEffectModifiers.map((modifier) => (
                    <ModifierComponent modifier={modifier} />
                  ))}
                </div>
              ) : null}
              {roundEffectRestrictions !== undefined ? (
                <div class="flex flex-col">
                  {roundEffectRestrictions.unitRestrictions.length > 0 ? (
                    <p>
                      Units:{" "}
                      {roundEffectRestrictions.unitRestrictions
                        .map((id) => getUnitNameFromId(id))
                        .join(", ")}
                    </p>
                  ) : null}
                  {roundEffectRestrictions.traitRestrictions.length > 0 ? (
                    <p>Traits: {roundEffectRestrictions.traitRestrictions.join(", ")}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <div class="absolute text-black bottom-13 right-8.5">
            {roundEffectRestrictions !== undefined &&
            roundEffectRestrictions.inspirationRangeRestriction !== undefined ? (
              <p>{roundEffectRestrictions.inspirationRangeRestriction}</p>
            ) : null}
          </div>
        </div>
        <div class="absolute bottom-0 text-white p-2 text-sm text-center">
          <p>{unitPreservation.map((id) => getUnitNameFromId(id)).join(", ")}</p>
        </div>
      </div>
    </div>
  );
};
