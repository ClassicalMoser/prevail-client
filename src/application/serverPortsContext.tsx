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
const ServerPortsContext = createContext<ServerPorts>();

const useServerPorts = (): ServerPorts => {
  const value = useContext(ServerPortsContext);
  if (value === undefined) {
    throw new Error(
      'useServerPorts must be used within a ServerPortsContext.Provider',
    );
  }
  return value;
};

const useArmies = (): Armies => useServerPorts().armies;

const useGames = (): Games => useServerPorts().games;

const useGameSeat = (): GameSeat => useServerPorts().gameSeat;

const useCommandCards = (): CommandCards => useServerPorts().commandCards;

const useUnitCards = (): UnitCards => useServerPorts().unitCards;

export {
  ServerPortsContext,
  useServerPorts,
  useArmies,
  useGames,
  useGameSeat,
  useCommandCards,
  useUnitCards,
};
