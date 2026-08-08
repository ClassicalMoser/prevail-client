import type { GameOutcome, PhaseSummary, PlayCardSlotView } from '@application';
import type {
  Command,
  LegalPlayerChoiceOptions,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';

export function waitHint(args: {
  options: LegalPlayerChoiceOptions | null;
  side: PlayerSide | undefined;
  phaseSummary: PhaseSummary | undefined;
  remaining: Partial<Record<PlayerSide, Command[]>> | null;
  playCardSlots: { you: PlayCardSlotView; opponent: PlayCardSlotView };
  outcome?: GameOutcome;
}): string | undefined {
  const { options, side, phaseSummary, remaining, playCardSlots, outcome } =
    args;
  if (outcome !== undefined && outcome.status !== 'ongoing') {
    return undefined;
  }
  if (options !== null) {
    return undefined;
  }
  if (side === undefined) {
    return undefined;
  }
  if (
    phaseSummary !== undefined &&
    phaseSummary.kind === 'phase' &&
    phaseSummary.phase === 'issueCommands'
  ) {
    const yours = remaining?.[side] ?? [];
    if (phaseSummary.step.includes('Resolve') && yours.length > 0) {
      return `Waiting for opponent to finish resolving — then you issue: ${yours.map((c) => `${c.type} ×${c.number} (${c.size})`).join(', ')}`;
    }
    if (
      phaseSummary.step.includes('Issue') ||
      phaseSummary.step.includes('Resolve')
    ) {
      return 'Waiting for opponent…';
    }
  }
  const slots = playCardSlots;
  if (slots.you.kind !== 'empty' && slots.opponent.kind === 'empty') {
    return 'Waiting for opponent to select a command card…';
  }
  if (slots.you.kind === 'empty' && slots.opponent.kind === 'facedown') {
    return 'Opponent has selected a card. Choose yours from your hand.';
  }
  if (
    slots.you.kind === 'facedown' ||
    (slots.you.kind === 'card' && slots.you.label === 'Selected')
  ) {
    return 'Card selected. Waiting for the round to continue…';
  }
  return undefined;
}
