import type {
  FailValidationResult,
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  UnitFacing,
  UnitInstance,
  UnitSupport,
} from '@classicalmoser/prevail-rules/domain';
import type { ChoiceListItem, SeatSelection } from '../selection';

interface SeatPlayActionsDeps {
  choicePending: () => boolean;
  setChoicePending: (pending: boolean) => void;
  setChoiceRejected: (rejection: FailValidationResult | undefined) => void;
  legalOptions: () => LegalPlayerChoiceOptions | undefined;
  selection: () => SeatSelection;
  setSelection: (selection: SeatSelection) => void;
  readGameState: () => GameState | undefined;
  lastAttempt: () => PlayerChoiceEvent | undefined;
  submit: (choice: PlayerChoiceEvent) => void;
}

interface SeatPlayActions {
  onCellClick: (coordinate: string) => void;
  onFacingClick: (coordinate: string, facing: UnitFacing) => void;
  onChoiceItem: (item: ChoiceListItem) => void;
  onSelectSetupUnit: (unit: UnitInstance) => void;
  onSelectIssueCommand: (index: number) => void;
  onConfirmIssueCommand: () => void;
  onDoneIssuingCommands: () => void;
  onRefuseCommit: () => void;
  onConfirmPerformRangedAttack: () => void;
  onConfirmAssignUnitSupport: () => void;
  onSelectAssignUnitSupportCard: (card: { unitSupport: UnitSupport }) => void;
  onToggleRoutCard: (cardId: string) => void;
  onChooseCardId: (cardId: string) => void;
  onUndo: () => void;
  onResetSelection: () => void;
  onRetryLastChoice: () => void;
  clearRejection: () => void;
}

export type { SeatPlayActionsDeps, SeatPlayActions };
