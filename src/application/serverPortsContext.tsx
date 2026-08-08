import type {
  Armies,
  CommandCards,
  GameSeat,
  Games,
  ServerPorts,
  UnitCards,
} from '@ports';
import { createContext, useContext } from 'solid-js';

/**
 * Server ports are a session-stable singleton built once at the composition root,
 * so the provider is mounted with a constant value in composition (no reactive prop).
 */
export const ServerPortsContext = createContext<ServerPorts>();

export const useServerPorts = (): ServerPorts => {
  const value = useContext(ServerPortsContext);
  if (value === undefined) {
    throw new Error(
      'useServerPorts must be used within a ServerPortsContext.Provider',
    );
  }
  return value;
};

export const useArmies = (): Armies => useServerPorts().armies;

export const useGames = (): Games => useServerPorts().games;

export const useGameSeat = (): GameSeat => useServerPorts().gameSeat;

export const useCommandCards = (): CommandCards =>
  useServerPorts().commandCards;

export const useUnitCards = (): UnitCards => useServerPorts().unitCards;
