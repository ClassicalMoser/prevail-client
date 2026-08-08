import type {
  Army,
  ArmyCompositionRules,
  CommandCard,
  GameModeName,
  UnitCount,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import {
  armyCompositionByMode,
  armyCompositionInitiatives,
  gameModeNames,
} from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import { createEffect, createMemo, createSignal } from 'solid-js';
import type { UseMutationResult } from '@tanstack/solid-query';
import {
  useOwnedArmyByIdQuery,
  useUpdateOwnedArmyMutation,
} from '@application/queries';
import {
  canAddCommandCard,
  canAddUnitType,
  maxCopiesForUnit,
} from './armyEditLimits';
import { validateArmyShape } from './validateArmyDraft';

export const isGameModeName = (value: string): value is GameModeName =>
  (gameModeNames as readonly string[]).includes(value);

/**
 * UI pairing of a persisted {@link Army} with a mode lens for composition
 * feedback. Mode compliance is not persisted and makes no long-term claim.
 */
export interface ArmyDraft {
  army: Army;
  gameMode: GameModeName;
}

export interface ArmyBudgetProjection {
  rules: ArmyCompositionRules;
  totalCost: number;
  totalMorale: number;
  cardsByInitiative: Readonly<Record<number, number>>;
  unitTypeSlotsUsed: number;
  unitTypeSlotsMax: number;
  commandCardCount: number;
  commandCardMax: number | null;
  /** Which composition requirements are currently met (for status-bar highlighting). */
  satisfied: {
    cost: boolean;
    morale: boolean;
    unitTypes: boolean;
    commandTotal: boolean;
    byInitiative: Readonly<Record<number, boolean>>;
  };
}

export interface UseArmyEditorResult {
  isLoading: Accessor<boolean>;
  gameMode: Accessor<GameModeName | undefined>;
  draft: Accessor<Army | undefined>;
  loadErrorMessage: Accessor<string | undefined>;
  shapeErrors: Accessor<readonly string[]>;
  isModeValid: Accessor<boolean>;
  budget: Accessor<ArmyBudgetProjection | undefined>;
  save: () => void;
  update: UseMutationResult<void, Error, Army>;
  maxCopiesFor: (unitType: UnitType) => number;
  canAddUnit: (unitType: UnitType) => boolean;
  canAddCommand: (card: CommandCard) => boolean;
  setUnitCount: (unitType: UnitType, count: number) => void;
  removeUnit: (unitTypeId: string) => void;
  addCommandCard: (card: CommandCard) => void;
  removeCommandCard: (listIndex: number) => void;
}

const projectBudget = (
  army: Army,
  mode: GameModeName,
): ArmyBudgetProjection => {
  const rules = armyCompositionByMode[mode];
  const totalCost = army.units.reduce(
    (sum, unit) => sum + unit.count * unit.unitType.cost,
    0,
  );
  const totalMorale = army.units.reduce(
    (sum, unit) => sum + unit.count * unit.unitType.morale,
    0,
  );
  const cardsByInitiative: Record<number, number> = {};
  for (const initiative of armyCompositionInitiatives) {
    cardsByInitiative[initiative] = 0;
  }
  for (const card of army.commandCards) {
    cardsByInitiative[card.initiative] =
      (cardsByInitiative[card.initiative] ?? 0) + 1;
  }
  const commandCardMax =
    rules.cardsPerInitiative === null
      ? null
      : rules.cardsPerInitiative * armyCompositionInitiatives.length;

  const byInitiativeSatisfied: Record<number, boolean> = {};
  for (const initiative of armyCompositionInitiatives) {
    const count = cardsByInitiative[initiative] ?? 0;
    byInitiativeSatisfied[initiative] =
      rules.cardsPerInitiative === null || count === rules.cardsPerInitiative;
  }

  return {
    rules,
    totalCost,
    totalMorale,
    cardsByInitiative,
    unitTypeSlotsUsed: army.units.length,
    unitTypeSlotsMax: rules.maxUnitTypeCount,
    commandCardCount: army.commandCards.length,
    commandCardMax,
    satisfied: {
      cost: rules.maxUnitCost === null || totalCost <= rules.maxUnitCost,
      morale:
        rules.minMoraleValue === null || totalMorale >= rules.minMoraleValue,
      unitTypes: army.units.length <= rules.maxUnitTypeCount,
      commandTotal:
        commandCardMax === null || army.commandCards.length === commandCardMax,
      byInitiative: byInitiativeSatisfied,
    },
  };
};

export function useArmyEditor(
  armyId: Accessor<string | undefined>,
  gameModeParam: Accessor<string | undefined>,
): UseArmyEditorResult {
  const owned = useOwnedArmyByIdQuery(armyId);
  const update = useUpdateOwnedArmyMutation();

  const [draft, setDraft] = createSignal<Army | undefined>();
  const [gameMode, setGameMode] = createSignal<GameModeName | undefined>();
  const [loadErrorMessage, setLoadErrorMessage] = createSignal<
    string | undefined
  >();
  const [shapeErrors, setShapeErrors] = createSignal<readonly string[]>([]);
  const [hydratedId, setHydratedId] = createSignal<string | undefined>();

  createEffect(() => {
    const id = armyId();
    const modeRaw = gameModeParam();

    if (id === undefined || modeRaw === undefined) {
      setDraft(undefined);
      setGameMode(undefined);
      setLoadErrorMessage(undefined);
      setShapeErrors([]);
      setHydratedId(undefined);
      return;
    }

    if (!isGameModeName(modeRaw)) {
      setDraft(undefined);
      setGameMode(undefined);
      setLoadErrorMessage(`Unknown game mode “${modeRaw}”.`);
      setShapeErrors([]);
      setHydratedId(undefined);
      return;
    }

    setGameMode(modeRaw);

    if (owned.isLoading || owned.isFetching) {
      if (hydratedId() !== id) {
        setDraft(undefined);
        setLoadErrorMessage(undefined);
        setShapeErrors([]);
      }
      return;
    }

    if (owned.isError) {
      setDraft(undefined);
      setLoadErrorMessage(
        owned.error instanceof Error
          ? owned.error.message
          : 'Failed to load army.',
      );
      setShapeErrors([]);
      setHydratedId(undefined);
      return;
    }

    const entry = owned.data;
    if (entry === undefined) {
      setDraft(undefined);
      setLoadErrorMessage('Army not found.');
      setShapeErrors([]);
      setHydratedId(undefined);
      return;
    }

    // Keep local edits after hydrate; only re-seed when id changes.
    if (hydratedId() === id && draft() !== undefined) {
      return;
    }

    const shape = validateArmyShape(entry);
    if (!shape.success) {
      setDraft(undefined);
      setLoadErrorMessage('Army failed shape validation on load.');
      setShapeErrors(shape.messages);
      setHydratedId(undefined);
      return;
    }

    setLoadErrorMessage(undefined);
    setShapeErrors([]);
    setDraft(shape.data);
    setHydratedId(id);
  });

  const applyLocalDraft = (next: Army): void => {
    const shape = validateArmyShape(next);
    if (!shape.success) {
      setShapeErrors(shape.messages);
      return;
    }
    setShapeErrors([]);
    setDraft(shape.data);
  };

  const save = (): void => {
    const army = draft();
    if (army === undefined) {
      return;
    }

    const shape = validateArmyShape(army);
    if (!shape.success) {
      setShapeErrors(shape.messages);
      return;
    }

    setShapeErrors([]);
    update.mutate(shape.data);
  };

  const maxCopiesFor = (unitType: UnitType): number =>
    maxCopiesForUnit(unitType);

  const canAddUnit = (unitType: UnitType): boolean => {
    const current = draft();
    const mode = gameMode();
    if (current === undefined || mode === undefined) {
      return false;
    }
    if (current.units.some((u) => u.unitType.id === unitType.id)) {
      return false;
    }
    return canAddUnitType(current, mode);
  };

  const canAddCommand = (card: CommandCard): boolean => {
    const current = draft();
    const mode = gameMode();
    if (current === undefined || mode === undefined) {
      return false;
    }
    return canAddCommandCard(current, mode, card);
  };

  const setUnitCount = (unitType: UnitType, count: number): void => {
    const current = draft();
    if (current === undefined) {
      return;
    }
    const mode = gameMode();
    if (mode === undefined) {
      return;
    }

    const existing = current.units.find((u) => u.unitType.id === unitType.id);
    const clamped = Math.max(0, Math.min(count, maxCopiesForUnit(unitType)));

    let units: UnitCount[];
    if (clamped === 0) {
      units = current.units.filter((u) => u.unitType.id !== unitType.id);
    } else if (existing === undefined) {
      if (!canAddUnitType(current, mode)) {
        return;
      }
      units = [...current.units, { unitType, count: clamped }];
    } else {
      units = current.units.map((u) =>
        u.unitType.id === unitType.id ? { unitType, count: clamped } : u,
      );
    }
    applyLocalDraft({ ...current, units });
  };

  const removeUnit = (unitTypeId: string): void => {
    const current = draft();
    if (current === undefined) {
      return;
    }
    applyLocalDraft({
      ...current,
      units: current.units.filter((u) => u.unitType.id !== unitTypeId),
    });
  };

  const addCommandCard = (card: CommandCard): void => {
    const current = draft();
    const mode = gameMode();
    if (current === undefined || mode === undefined) {
      return;
    }
    if (!canAddCommandCard(current, mode, card)) {
      return;
    }
    applyLocalDraft({
      ...current,
      commandCards: [...current.commandCards, card],
    });
  };

  const removeCommandCard = (listIndex: number): void => {
    const current = draft();
    if (current === undefined) {
      return;
    }
    applyLocalDraft({
      ...current,
      commandCards: current.commandCards.filter((_, i) => i !== listIndex),
    });
  };

  const budget = createMemo((): ArmyBudgetProjection | undefined => {
    const army = draft();
    const mode = gameMode();
    if (army === undefined || mode === undefined) {
      return;
    }
    return projectBudget(army, mode);
  });

  const isModeValid = createMemo(() => {
    const b = budget();
    if (b === undefined || draft() === undefined || shapeErrors().length > 0) {
      return false;
    }
    const { satisfied } = b;
    return (
      satisfied.cost &&
      satisfied.morale &&
      satisfied.unitTypes &&
      satisfied.commandTotal &&
      Object.values(satisfied.byInitiative).every(Boolean)
    );
  });

  const isLoading = (): boolean => {
    const id = armyId();
    if (id === undefined) {
      return false;
    }
    return (
      (owned.isLoading || owned.isFetching) &&
      draft() === undefined &&
      loadErrorMessage() === undefined
    );
  };

  return {
    isLoading,
    gameMode,
    draft,
    loadErrorMessage,
    shapeErrors,
    isModeValid,
    budget,
    save,
    update,
    maxCopiesFor,
    canAddUnit,
    canAddCommand,
    setUnitCount,
    removeUnit,
    addCommandCard,
    removeCommandCard,
  };
}
