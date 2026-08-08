import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application';

export function routDiscardHint(
  options: LegalPlayerChoiceOptions | null,
  selection: SeatSelection,
): string | null {
  if (options?.choiceType !== 'chooseRoutDiscard') {
    return null;
  }
  const need = options.routDiscard.numberToDiscard;
  const have = options.routDiscard.cardIds.length;
  const cards = need === 1 ? 'card' : 'cards';
  if (have < need) {
    return `Rout penalty: discard ${need} ${cards} — you only have ${have} in hand.`;
  }
  const picked =
    selection.kind === 'routDiscard' ? selection.selectedCardIds.length : 0;
  return `Rout penalty: discard ${need} ${cards} from your hand (tap to toggle) · ${picked}/${need}`;
}
