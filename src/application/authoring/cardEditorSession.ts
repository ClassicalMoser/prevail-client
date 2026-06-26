/** In-memory authoring draft for one card id, survives editor page unmount. */
export interface CardEditorSession<T> {
  draft: T;
  isNewVersion: boolean;
}

const cardEditorSessions = new Map<string, CardEditorSession<unknown>>();

export function getCardEditorSession<T>(
  cardId: string,
): CardEditorSession<T> | undefined {
  return cardEditorSessions.get(cardId) as CardEditorSession<T> | undefined;
}

export function setCardEditorSession<T>(
  cardId: string,
  session: CardEditorSession<T>,
): void {
  cardEditorSessions.set(cardId, session);
}

export function clearCardEditorSession(cardId: string): void {
  cardEditorSessions.delete(cardId);
}
