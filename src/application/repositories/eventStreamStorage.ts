import type { Event } from '@classicalmoser/prevail-rules/domain';
import type { EventStreamStorage, PortResponse } from '@domain';
import { composeRoundKey } from './composeRoundKey';

/**
 * Copy the buffer and freeze it so a caller cannot append through the returned list.
 * The map keeps the mutable buffer. That buffer is how this store appends.
 */
function frozenCopy<T>(items: readonly T[]): readonly T[] {
  const copy = [...items];
  const frozen = Object.freeze(copy);
  return frozen;
}

/**
 * In-memory {@link EventStreamStorage}, keyed by game and round.
 * A new map is allocated per call. Mount the result once with the engine.
 */
function createEventStreamStorage(): EventStreamStorage {
  const streams = new Map<string, Event[]>();

  /**
   * Load the ordered event list for a game round, or `undefined` if no stream exists yet.
   */
  const getEventStream = async (
    gameId: string,
    roundNumber: number,
  ): Promise<PortResponse<readonly Event[] | undefined>> => {
    const key = composeRoundKey(gameId, roundNumber);
    const events = streams.get(key);
    if (events === undefined) {
      const missing: PortResponse<readonly Event[] | undefined> = {
        result: true,
        data: undefined,
      };
      return missing;
    }
    const data = frozenCopy(events);
    const found: PortResponse<readonly Event[] | undefined> = {
      result: true,
      data,
    };
    return found;
  };

  /**
   * Append an event to the stream, creating the stream if this is the first event for that round.
   */
  const addEventToStream = async (
    gameId: string,
    roundNumber: number,
    event: Event,
  ): Promise<PortResponse<readonly Event[] | undefined>> => {
    const key = composeRoundKey(gameId, roundNumber);
    let list = streams.get(key);
    if (list === undefined) {
      list = [];
      streams.set(key, list);
    }
    list.push(event);
    const nextStream = frozenCopy(list);
    const appended: PortResponse<readonly Event[] | undefined> = {
      result: true,
      data: nextStream,
    };
    return appended;
  };

  /**
   * Remove the stream for a round after it has been persisted or abandoned.
   */
  const flushEventStream = async (
    gameId: string,
    roundNumber: number,
  ): Promise<PortResponse<void>> => {
    const key = composeRoundKey(gameId, roundNumber);
    streams.delete(key);
    const flushed: PortResponse<void> = { result: true, data: undefined };
    return flushed;
  };

  /**
   * Start an empty stream for a round. Fails if a stream already exists for that key.
   */
  const newEventStream = async (
    gameId: string,
    roundNumber: number,
  ): Promise<PortResponse<readonly Event[]>> => {
    const key = composeRoundKey(gameId, roundNumber);
    if (streams.has(key)) {
      const duplicate: PortResponse<readonly Event[]> = {
        result: false,
        errorReason: 'Event stream already exists for this game and round',
      };
      return duplicate;
    }
    const empty: Event[] = [];
    streams.set(key, empty);
    const data = frozenCopy(empty);
    const created: PortResponse<readonly Event[]> = { result: true, data };
    return created;
  };

  /**
   * Drop events from `firstEventToRemove` through the end of the stream; return the truncated list.
   */
  const truncateEventStream = async (
    gameId: string,
    roundNumber: number,
    firstEventToRemove: number,
  ): Promise<PortResponse<readonly Event[]>> => {
    const key = composeRoundKey(gameId, roundNumber);
    const list = streams.get(key);
    if (list === undefined) {
      const missing: PortResponse<readonly Event[]> = {
        result: false,
        errorReason: 'Event stream not found',
      };
      return missing;
    }
    if (firstEventToRemove < 0 || firstEventToRemove > list.length) {
      const outOfRange: PortResponse<readonly Event[]> = {
        result: false,
        errorReason: 'firstEventToRemove out of range for event stream',
      };
      return outOfRange;
    }
    list.splice(firstEventToRemove);
    const data = frozenCopy(list);
    const truncated: PortResponse<readonly Event[]> = { result: true, data };
    return truncated;
  };

  const storage: EventStreamStorage = {
    getEventStream,
    addEventToStream,
    flushEventStream,
    newEventStream,
    truncateEventStream,
  };
  return storage;
}

export { createEventStreamStorage };
