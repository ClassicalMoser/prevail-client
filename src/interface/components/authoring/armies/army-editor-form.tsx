import type {
  Army,
  CommandCard,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import type { ArmyBudgetProjection } from '@application';
import type { Accessor, JSX } from 'solid-js';
import { ArmyCommandCardsSection } from './army-command-cards-section';
import { ArmyCompositionHeader } from './army-composition-header';
import { ArmyUnitsSection } from './army-units-section';

export const ArmyEditorForm = (props: {
  army: Accessor<Army>;
  gameMode: Accessor<string | undefined>;
  budget: Accessor<ArmyBudgetProjection | undefined>;
  isModeValid: Accessor<boolean>;
  unitCatalog: Accessor<UnitType[] | undefined>;
  isUnitCatalogLoading: Accessor<boolean>;
  commandCatalog: Accessor<CommandCard[] | undefined>;
  isCommandCatalogLoading: Accessor<boolean>;
  canAddUnit: (unitType: UnitType) => boolean;
  maxCopiesFor: (unitType: UnitType) => number;
  canAddCommand: (card: CommandCard) => boolean;
  onSetUnitCount: (unitType: UnitType, count: number) => void;
  onRemoveUnit: (unitTypeId: string) => void;
  onAddCommandCard: (card: CommandCard) => void;
  onRemoveCommandCard: (listIndex: number) => void;
}): JSX.Element => (
  <div class="flex flex-col gap-6">
    <ArmyCompositionHeader
      gameMode={props.gameMode}
      budget={props.budget}
      isModeValid={props.isModeValid}
    />
    <ArmyUnitsSection
      units={() => props.army().units}
      catalog={props.unitCatalog}
      isCatalogLoading={props.isUnitCatalogLoading}
      canAddUnit={props.canAddUnit}
      maxCopiesFor={props.maxCopiesFor}
      onSetCount={props.onSetUnitCount}
      onRemove={props.onRemoveUnit}
    />
    <ArmyCommandCardsSection
      commandCards={() => props.army().commandCards}
      catalog={props.commandCatalog}
      isCatalogLoading={props.isCommandCatalogLoading}
      canAddCommand={props.canAddCommand}
      onAdd={props.onAddCommandCard}
      onRemove={props.onRemoveCommandCard}
    />
  </div>
);
