import type {
  CommandCard,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { CommandCardCommandSection } from './command-card-command-section';
import { CommandCardDiscardModifiersSection } from './command-card-discard-modifiers-section';
import { CommandCardIdentitySection } from './command-card-identity-section';
import { CommandCardRoundEffectSection } from './command-card-round-effect-section';
import { CommandCardUnitSupportSection } from './command-card-unit-support-section';

export const CommandCardForm = (props: {
  card: Accessor<CommandCard>;
  onChange: (card: CommandCard) => void;
  unitCatalog: Accessor<UnitType[] | undefined>;
  isUnitCatalogLoading: Accessor<boolean>;
}): JSX.Element => (
  <div class="grid gap-6">
    <CommandCardIdentitySection card={props.card} onChange={props.onChange} />
    <CommandCardDiscardModifiersSection
      card={props.card}
      onChange={props.onChange}
    />
    <CommandCardCommandSection card={props.card} onChange={props.onChange} />
    <CommandCardRoundEffectSection
      card={props.card}
      onChange={props.onChange}
    />
    <CommandCardUnitSupportSection
      card={props.card}
      onChange={props.onChange}
      unitCatalog={props.unitCatalog}
      isUnitCatalogLoading={props.isUnitCatalogLoading}
    />

    <div class="text-muted-foreground text-xs">
      <p class="text-sm font-medium">CommandCard ID</p>
      <p class="font-mono">{props.card().id}</p>
    </div>
  </div>
);
