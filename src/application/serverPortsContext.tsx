import type { CommandCards, ServerPorts, UnitCards } from '@ports';
import type { JSX, ParentProps } from 'solid-js';
import { createContext, useContext } from 'solid-js';

const ServerPortsContext = createContext<ServerPorts>();

interface ServerPortsProviderProps extends ParentProps {
  value: ServerPorts;
}

export const ServerPortsProvider = (
  props: ServerPortsProviderProps,
): JSX.Element => (
  <ServerPortsContext.Provider value={props.value}>
    {props.children}
  </ServerPortsContext.Provider>
);

export const useServerPorts = (): ServerPorts => {
  const value = useContext(ServerPortsContext);
  if (value === undefined) {
    throw new Error('useServerPorts must be used within a ServerPortsProvider');
  }
  return value;
};

export const useCommandCards = (): CommandCards =>
  useServerPorts().commandCards;

export const useUnitCards = (): UnitCards => useServerPorts().unitCards;
