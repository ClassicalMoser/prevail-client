import {
  GAME_EFFECT_EVENT_TYPE,
  GAME_OVER_EFFECT_TYPE,
} from '@classicalmoser/prevail-rules/domain';
import type { Event } from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import { createEventStreamStorage } from './eventStreamStorage';

function gameOver(eventNumber: number): Event {
  const event: Event = {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: GAME_OVER_EFFECT_TYPE,
    eventNumber,
    winner: 'white',
  };
  return event;
}

describe('in-memory event stream storage', () => {
  it('reports no data when the round has no stream', async () => {
    expect.hasAssertions();
    const storage = createEventStreamStorage();
    const response = await storage.getEventStream('game-1', 1);

    expect(response).toStrictEqual({ result: true, data: undefined });
  }, 1000);

  it('rejects a second empty stream for the same round', async () => {
    expect.hasAssertions();
    const storage = createEventStreamStorage();
    await storage.newEventStream('game-1', 1);
    const response = await storage.newEventStream('game-1', 1);

    expect(response).toStrictEqual({
      result: false,
      errorReason: 'Event stream already exists for this game and round',
    });
  }, 1000);

  it('appends onto a stream created by the first event', async () => {
    expect.hasAssertions();
    const storage = createEventStreamStorage();
    const first = gameOver(0);
    const second = gameOver(1);
    await storage.addEventToStream('game-1', 1, first);
    const response = await storage.addEventToStream('game-1', 1, second);

    expect(response).toStrictEqual({
      result: true,
      data: [first, second],
    });
  }, 1000);

  it('rejects a truncate when the stream is missing', async () => {
    expect.hasAssertions();
    const storage = createEventStreamStorage();
    const response = await storage.truncateEventStream('game-1', 1, 0);

    expect(response).toStrictEqual({
      result: false,
      errorReason: 'Event stream not found',
    });
  }, 1000);

  it('rejects a truncate index past the end of the stream', async () => {
    expect.hasAssertions();
    const storage = createEventStreamStorage();
    await storage.addEventToStream('game-1', 1, gameOver(0));
    const response = await storage.truncateEventStream('game-1', 1, 2);

    expect(response).toStrictEqual({
      result: false,
      errorReason: 'firstEventToRemove out of range for event stream',
    });
  }, 1000);

  it('drops events from the truncate index through the end', async () => {
    expect.hasAssertions();
    const storage = createEventStreamStorage();
    const first = gameOver(0);
    const second = gameOver(1);
    await storage.addEventToStream('game-1', 1, first);
    await storage.addEventToStream('game-1', 1, second);
    const response = await storage.truncateEventStream('game-1', 1, 1);

    expect(response).toStrictEqual({ result: true, data: [first] });
  }, 1000);
});
