import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '../selection';

/** Copy for the rout-discard penalty, or undefined when that choice is not active. */
function routDiscardHint(
  options: LegalPlayerChoiceOptions | undefined,
  selection: SeatSelection,
): string | undefined {
  if (options?.choiceType !== 'chooseRoutDiscard') {
    return undefined;
  }
  const need = options.routDiscard.numberToDiscard;
  const have = options.routDiscard.cardIds.length;
  const cards = need === 1 ? 'card' : 'cards';
  if (have < need) {
    const hint = `Rout penalty: discard ${need} ${cards} — you only have ${have} in hand.`;
    return hint;
  }
  const picked =
    selection.kind === 'routDiscard' ? selection.selectedCardIds.length : 0;
  const hint = `Rout penalty: discard ${need} ${cards} from your hand (tap to toggle) · ${picked}/${need}`;
  return hint;
}

export { routDiscardHint };
