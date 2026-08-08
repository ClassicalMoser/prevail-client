import type {
  GameModeName,
  GameState,
} from '@classicalmoser/prevail-rules/domain';
import type { SeatGameSnapshot } from './seatStreamSession';

export interface GameStateIngestChange {
  gameId: string;
  gameMode: GameModeName;
  gameState: GameState;
}

export interface GameStateIngestPorts {
  setSubscribedGame: (gameId: string, gameMode: GameModeName) => void;
  ingest: (change: GameStateIngestChange) => void;
}

/** Bind the store to a route id before the first snapshot arrives. */
export function subscribeRouteGame(
  ports: GameStateIngestPorts,
  gameId: string,
  gameMode: GameModeName,
): void {
  ports.setSubscribedGame(gameId, gameMode);
}

/** Authoritative seat snapshot → subscription + ingest. */
export function ingestSeatSnapshot(
  ports: GameStateIngestPorts,
  snapshot: SeatGameSnapshot,
): void {
  ports.setSubscribedGame(snapshot.id, snapshot.gameMode);
  ports.ingest({
    gameId: snapshot.id,
    gameMode: snapshot.gameMode,
    gameState: snapshot.gameState,
  });
}

/** Folded mid-round event → ingest (subscription already set). */
export function ingestFoldedGameState(
  ports: GameStateIngestPorts,
  change: GameStateIngestChange,
): void {
  ports.ingest(change);
}
