import type { AuthPort, AuthState } from '@ports';
import type { JSX, ParentProps } from 'solid-js';
import {
  createContext,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js';

const AuthContext = createContext<AuthPort>();

interface AuthProviderProps extends ParentProps {
  value: AuthPort;
}

export const AuthProvider = (props: AuthProviderProps): JSX.Element => (
  <AuthContext.Provider value={props.value}>
    {props.children}
  </AuthContext.Provider>
);

export const useAuthPort = (): AuthPort => {
  const value = useContext(AuthContext);
  if (value === undefined) {
    throw new Error('useAuthPort must be used within an AuthProvider');
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
