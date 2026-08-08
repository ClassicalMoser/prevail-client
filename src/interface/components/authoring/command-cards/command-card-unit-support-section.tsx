import type {
  CommandCard,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@interface/card';
import { UnitSupportEditor } from './unit-support-editor';

export const CommandCardUnitSupportSection = (props: {
  card: Accessor<CommandCard>;
  onChange: (card: CommandCard) => void;
  unitCatalog: Accessor<UnitType[] | undefined>;
  isUnitCatalogLoading: Accessor<boolean>;
}): JSX.Element => (
  <UiCard class="overflow-visible!">
    <CardHeader>
      <CardTitle>Unit support</CardTitle>
      <CardDescription>Units this card can support.</CardDescription>
    </CardHeader>
    <CardContent class="overflow-visible!">
      <UnitSupportEditor
        unitSupport={() => props.card().unitSupport}
        onChange={(unitSupport) => {
          props.onChange({ ...props.card(), unitSupport });
        }}
        unitCatalog={props.unitCatalog}
        isUnitCatalogLoading={props.isUnitCatalogLoading}
      />
    </CardContent>
  </UiCard>
);
