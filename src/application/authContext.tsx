import type { AuthPort, AuthState } from '@ports';
import {
  createContext,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js';

/**
 * The auth port is a session-stable singleton built once at the composition root.
 * Reactivity lives inside the port (auth state via subscribe), not in the context
 * value, so the provider is mounted with a constant in composition.
 */
export const AuthContext = createContext<AuthPort>();

export const useAuthPort = (): AuthPort => {
  const value = useContext(AuthContext);
  if (value === undefined) {
    throw new Error('useAuthPort must be used within an AuthContext.Provider');
  }
  return value;
};

export interface AuthViewModel {
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  authUser: () => AuthState['authUser'];
  getAccessToken: AuthPort['getAccessToken'];
  login: AuthPort['login'];
  logout: AuthPort['logout'];
}

export const useAuth = (): AuthViewModel => {
  const port = useAuthPort();
  const [state, setState] = createSignal(port.getState());

  onMount(() => {
    const unsubscribe = port.subscribe(() => setState(port.getState()));
    onCleanup(unsubscribe);
  });

  return {
    isAuthenticated: () => state().isAuthenticated,
    isLoading: () => state().isLoading,
    authUser: () => state().authUser,
    getAccessToken: port.getAccessToken.bind(port),
    login: port.login.bind(port),
    logout: port.logout.bind(port),
  };
};
