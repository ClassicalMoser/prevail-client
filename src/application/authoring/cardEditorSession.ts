/** In-memory authoring draft for one card id, survives editor page unmount. */
interface CardEditorSession<T> {
  draft: T;
  isNewVersion: boolean;
}

const cardEditorSessions = new Map<string, CardEditorSession<unknown>>();

function getCardEditorSession<T>(
  cardId: string,
): CardEditorSession<T> | undefined {
  return cardEditorSessions.get(cardId) as CardEditorSession<T> | undefined;
}

function setCardEditorSession<T>(
  cardId: string,
  session: CardEditorSession<T>,
): void {
  cardEditorSessions.set(cardId, session);
}

function clearCardEditorSession(cardId: string): void {
  cardEditorSessions.delete(cardId);
}

export {
  type CardEditorSession,
  getCardEditorSession,
  setCardEditorSession,
  clearCardEditorSession,
};
