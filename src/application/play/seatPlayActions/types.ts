import type {
  FailValidationResult,
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  UnitFacing,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import type { ChoiceListItem, SeatSelection } from '../selection';

export interface SeatPlayActionsDeps {
  choicePending: () => boolean;
  setChoicePending: (pending: boolean) => void;
  setChoiceRejected: (rejection: FailValidationResult | undefined) => void;
  legalOptions: () => LegalPlayerChoiceOptions | null;
  selection: () => SeatSelection;
  setSelection: (selection: SeatSelection) => void;
  readGameState: () => GameState | undefined;
  lastAttempt: () => PlayerChoiceEvent | undefined;
  submit: (choice: PlayerChoiceEvent) => void;
}

export interface SeatPlayActions {
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
  onSelectAssignUnitSupportCard: (cardId: string) => void;
  onToggleRoutCard: (cardId: string) => void;
  onChooseCardId: (cardId: string) => void;
  onUndo: () => void;
  onResetSelection: () => void;
  onRetryLastChoice: () => void;
  clearRejection: () => void;
}
