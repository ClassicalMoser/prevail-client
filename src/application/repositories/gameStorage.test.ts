import {
  blackTinyStarterArmy,
  createEmptyGameState,
  projectGameForVisibility,
  whiteTinyStarterArmy,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Game,
  GameForVisibility,
  GameState,
} from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import { createGameStorage } from './gameStorage';

function authoritativeGame(id: string): GameForVisibility<'authoritative'> {
  const gameState = createEmptyGameState('standard');
  const game: GameForVisibility<'authoritative'> = {
    id,
    gameMode: 'standard',
    gameState,
    blackPlayer: 'black-player',
    whitePlayer: 'white-player',
    blackArmy: blackTinyStarterArmy,
    whiteArmy: whiteTinyStarterArmy,
  };
  return game;
}

function nextRound(gameState: GameState): GameState {
  const next: GameState = {
    ...gameState,
    currentRoundNumber: gameState.currentRoundNumber + 1,
  };
  return next;
}

describe('in-memory game storage', () => {
  it('rejects a read for a missing id', async () => {
    expect.hasAssertions();
    const storage = createGameStorage();
    const response = await storage.getGame('missing', 'standard');

    expect(response).toStrictEqual({
      result: false,
      errorReason: 'Game not found',
    });
  }, 1000);

  it('rejects a read when the mode does not match the stored game', async () => {
    expect.hasAssertions();
    const storage = createGameStorage();
    const game = authoritativeGame('game-1');
    await storage.saveNewGame(game);
    const response = await storage.getGame('game-1', 'mini');

    expect(response).toStrictEqual({
      result: false,
      errorReason: 'Game type mismatch',
    });
  }, 1000);

  it('returns the game that was saved', async () => {
    expect.hasAssertions();
    const storage = createGameStorage();
    const game = authoritativeGame('game-1');
    await storage.saveNewGame(game);
    const response = await storage.getGame('game-1', 'standard');

    expect(response).toStrictEqual({ result: true, data: game });
  }, 1000);

  it('rejects a second save of the same id', async () => {
    expect.hasAssertions();
    const storage = createGameStorage();
    const game = authoritativeGame('game-1');
    await storage.saveNewGame(game);
    const response = await storage.saveNewGame(game);

    expect(response).toStrictEqual({
      result: false,
      errorReason: 'Game already exists',
    });
  }, 1000);

  it('rejects an update for a missing id', async () => {
    expect.hasAssertions();
    const storage = createGameStorage();
    const game = authoritativeGame('game-1');
    const response = await storage.updateGameState('missing', game.gameState);

    expect(response).toStrictEqual({
      result: false,
      errorReason: 'Game not found',
    });
  }, 1000);

  it('rejects an update whose visibility differs from the stored game', async () => {
    expect.hasAssertions();
    const storage = createGameStorage();
    const game = authoritativeGame('game-1');
    await storage.saveNewGame(game);
    const seen: Game = projectGameForVisibility(game, 'whiteSeen');
    const response = await storage.updateGameState(game.id, seen.gameState);

    expect(response).toStrictEqual({
      result: false,
      errorReason: 'Game state visibility mismatch',
    });
  }, 1000);

  it('stores a same-visibility snapshot', async () => {
    expect.hasAssertions();
    const storage = createGameStorage();
    const game = authoritativeGame('game-1');
    await storage.saveNewGame(game);
    const gameState = nextRound(game.gameState);
    const updated = await storage.updateGameState(game.id, gameState);
    const response = await storage.getGame(game.id, 'standard');

    expect(updated).toStrictEqual({ result: true, data: undefined });
    expect(response).toMatchObject({
      result: true,
      data: {
        gameState: {
          currentRoundNumber: gameState.currentRoundNumber,
          cardState: { visibility: 'authoritative' },
        },
      },
    });
  }, 1000);
});
