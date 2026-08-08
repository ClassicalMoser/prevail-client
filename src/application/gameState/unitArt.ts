import AfricanElephants from '../../assets/units/African Elephants.png';
import AlaeSocii from '../../assets/units/Alae Socii.png';
import Equites from '../../assets/units/Equites.png';
import LybianSpearmen from '../../assets/units/Lybian Spearmen.png';
import LybianVeterans from '../../assets/units/Lybian Veterans.png';
import ManipularLegions from '../../assets/units/Manipular Legions.png';
import NumidianCavalry from '../../assets/units/Numidian Cavalry.png';
import NumidianSkirmishers from '../../assets/units/Numidian Skirmishers.png';
import PunicCavalry from '../../assets/units/Punic Cavalry.png';
import PunicCitizenSpearmen from '../../assets/units/Punic Citizen Spearmen.png';
import Triarii from '../../assets/units/Triarii.png';
import Velites from '../../assets/units/Velites.png';

/** Local asset map keyed by unit type `name` (capitalized with spaces). */
const unitArtByName: Readonly<Record<string, string>> = {
  'African Elephants': AfricanElephants,
  'Alae Socii': AlaeSocii,
  Equites,
  'Lybian Spearmen': LybianSpearmen,
  'Lybian Veterans': LybianVeterans,
  'Manipular Legions': ManipularLegions,
  'Numidian Cavalry': NumidianCavalry,
  'Numidian Skirmishers': NumidianSkirmishers,
  'Punic Cavalry': PunicCavalry,
  'Punic Citizen Spearmen': PunicCitizenSpearmen,
  Triarii,
  Velites,
};

/**
 * Resolves a unit type name to a bundled image URL, or `undefined` when no asset exists.
 */
export const resolveUnitArtSrc = (unitTypeName: string): string | undefined =>
  unitArtByName[unitTypeName];
