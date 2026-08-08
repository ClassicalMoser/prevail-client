import type {
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type { Accessor, Setter } from 'solid-js';
import { createEffect, createMemo, untrack } from 'solid-js';
import { resetStagedSelection } from './selection';
import type { SeatSelection } from './selection';

function draftAligned(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
): boolean {
  return (
    (options.choiceType === 'moveUnit' && selection.kind === 'moveUnit') ||
    (options.choiceType === 'performRangedAttack' &&
      selection.kind === 'performRangedAttack') ||
    (options.choiceType === 'issueCommand' &&
      selection.kind === 'issueCommand') ||
    (options.choiceType === 'setupUnits' && selection.kind === 'setup') ||
    (options.choiceType === 'chooseRoutDiscard' &&
      selection.kind === 'routDiscard') ||
    (options.choiceType === 'assignUnitSupport' &&
      selection.kind === 'assignUnitSupport')
  );
}

function needsDraft(options: LegalPlayerChoiceOptions): boolean {
  return (
    options.choiceType === 'moveUnit' ||
    options.choiceType === 'performRangedAttack' ||
    options.choiceType === 'issueCommand' ||
    options.choiceType === 'setupUnits' ||
    options.choiceType === 'chooseRoutDiscard' ||
    options.choiceType === 'assignUnitSupport'
  );
}

/** Keep local seat draft in sync when legal options identity / kind drifts. */
export function bindSeatSelectionSync(args: {
  legalOptions: Accessor<LegalPlayerChoiceOptions | null>;
  selection: Accessor<SeatSelection>;
  setSelection: Setter<SeatSelection>;
  readGameState: () => GameState | undefined;
  setChoicePending: (pending: boolean) => void;
  setChoiceRejected: (rejection: undefined) => void;
  setLastAttempt: (attempt: undefined) => void;
}): void {
  const optionsIdentity = createMemo(() => {
    const options = args.legalOptions();
    if (options === null) {
      return 'none';
    }
    return `${options.choiceType}:${options.expectedEventNumber}`;
  });

  createEffect((prevIdentity?: string) => {
    const identity = optionsIdentity();
    if (prevIdentity === identity) {
      return identity;
    }
    untrack(() => {
      args.setChoicePending(false);
      args.setChoiceRejected(undefined);
      args.setLastAttempt(undefined);
      args.setSelection(
        resetStagedSelection(args.legalOptions(), args.readGameState()),
      );
    });
    return identity;
  });

  createEffect(() => {
    const options = args.legalOptions();
    const sel = args.selection();
    if (options === null) {
      return;
    }
    if (needsDraft(options) && !draftAligned(options, sel)) {
      args.setSelection(resetStagedSelection(options, args.readGameState()));
    }
  });
}
