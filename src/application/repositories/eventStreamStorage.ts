import type {
  Board,
  Event,
  EventType,
} from "@classicalmoser/prevail-rules/domain";
import type { EventStreamStorage, PortResponse } from "@domain";
import { compositeRoundKey } from "./compositeRoundKey";

function frozenCopy<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export const useEventStreamStorage = (): EventStreamStorage => {
  const streams = new Map<string, Event<Board, EventType>[]>();

  /**
   * Load the ordered event list for a game round, or `undefined` if no stream exists yet.
   */
  const getEventStream = async (
    gameId: string,
    roundNumber: number,
  ): Promise<PortResponse<readonly Event<Board, EventType>[] | undefined>> => {
    const key = compositeRoundKey(gameId, roundNumber);
    if (!streams.has(key)) {
      return { result: true, data: undefined };
    }
    const events = streams.get(key)!;
    return { result: true, data: frozenCopy(events) };
  };

  /**
   * Append an event to the stream, creating the stream if this is the first event for that round.
   */
  const addEventToStream = async (
    gameId: string,
    roundNumber: number,
    event: Event<Board, EventType>,
  ): Promise<PortResponse<readonly Event<Board>[] | undefined>> => {
    const key = compositeRoundKey(gameId, roundNumber);
    let list = streams.get(key);
    if (!list) {
      list = [];
      streams.set(key, list);
    }
    list.push(event);
    const nextStream = frozenCopy(list);
    return { result: true, data: nextStream };
  };

  /**
   * Remove the stream for a round after it has been persisted or abandoned.
   */
  const flushEventStream = async (
    gameId: string,
    roundNumber: number,
  ): Promise<PortResponse<void>> => {
    streams.delete(compositeRoundKey(gameId, roundNumber));
    return { result: true, data: undefined };
  };

  /**
   * Start an empty stream for a round. Fails if a stream already exists for that key.
   */
  const newEventStream = async (
    gameId: string,
    roundNumber: number,
  ): Promise<PortResponse<readonly Event<Board, EventType>[]>> => {
    const key = compositeRoundKey(gameId, roundNumber);
    if (streams.has(key)) {
      return {
        result: false,
        errorReason: "Event stream already exists for this game and round",
      };
    }
    const empty: Event<Board, EventType>[] = [];
    streams.set(key, empty);
    return { result: true, data: frozenCopy(empty) };
  };

  /**
   * Drop events from `firstEventToRemove` through the end of the stream; return the truncated list.
   */
  const truncateEventStream = async (
    gameId: string,
    roundNumber: number,
    firstEventToRemove: number,
  ): Promise<PortResponse<readonly Event<Board, EventType>[]>> => {
    const key = compositeRoundKey(gameId, roundNumber);
    const list = streams.get(key);
    if (!list) {
      return { result: false, errorReason: "Event stream not found" };
    }
    if (firstEventToRemove < 0 || firstEventToRemove > list.length) {
      return {
        result: false,
        errorReason: "firstEventToRemove out of range for event stream",
      };
    }
    list.splice(firstEventToRemove);
    return { result: true, data: frozenCopy(list) };
  };

  return {
    getEventStream,
    addEventToStream,
    flushEventStream,
    newEventStream,
    truncateEventStream,
  };
};
