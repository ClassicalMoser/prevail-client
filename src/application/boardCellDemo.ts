import type { UnitFacing } from "@classicalmoser/prevail-rules/domain";
import AfricanElephants from "../assets/units/African Elephants.png";
import AlaeSocii from "../assets/units/Alae Socii.png";
import LybianSpearmen from "../assets/units/Lybian Spearmen.png";
import ManipularLegions from "../assets/units/Manipular Legions.png";
import NumidianCavalry from "../assets/units/Numidian Cavalry.png";
import Velites from "../assets/units/Velites.png";

/**
 * Impure placeholder visuals for empty board cells until real unit state exists.
 * Lives in application so the interface stays free of demo policy.
 */
export type BoardCellDemo = {
  shouldShowUnit: () => boolean;
  randomFacing: () => UnitFacing;
  randomUnitImageSrc: () => string;
};

const randomFacing = (): UnitFacing => {
  const randomNumber = Math.random();
  switch (true) {
    case randomNumber > 0.8:
      return "north";
    case randomNumber > 0.7:
      return "northEast";
    case randomNumber > 0.6:
      return "east";
    case randomNumber > 0.5:
      return "southEast";
    case randomNumber > 0.4:
      return "southWest";
    case randomNumber > 0.3:
      return "west";
    case randomNumber > 0.2:
      return "northWest";
    default:
      return "south";
  }
};

const randomUnitImageSrc = (): string => {
  const randomNumber = Math.random();
  if (randomNumber > 0.8) {
    return AfricanElephants;
  }
  if (randomNumber > 0.6) {
    return AlaeSocii;
  }
  if (randomNumber > 0.4) {
    return NumidianCavalry;
  }
  if (randomNumber > 0.2) {
    return ManipularLegions;
  }
  if (randomNumber > 0.1) {
    return LybianSpearmen;
  }
  if (randomNumber > 0.05) {
    return Velites;
  }
  return AlaeSocii;
};

export const boardCellDemo: BoardCellDemo = {
  shouldShowUnit: () => Math.random() > 0.8,
  randomFacing,
  randomUnitImageSrc,
};
