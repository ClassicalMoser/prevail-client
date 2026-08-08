import type { Permission } from '@classicalmoser/prevail-contracts';
import type { AuthPort, AuthState, AuthUser } from '@ports';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import type { Auth0Client, User } from '@auth0/auth0-spa-js';
import { auth0Config } from './auth0Config';

function readAuthUser(user: User | undefined): AuthUser | undefined {
  if (!user?.email) {
    return undefined;
  }

  return {
    email: user.email,
    roles: [],
  };
}

function isAuthRedirect(): boolean {
  const params = new URLSearchParams(globalThis.location.search);
  return params.has('code') && params.has('state');
}

export async function createAuth0Port(): Promise<AuthPort> {
  const { audience, clientId, domain, scope, redirectUri } = auth0Config;

  if (!domain || !clientId) {
    throw new Error(
      'Auth0 configuration missing. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID.',
    );
  }

  const client: Auth0Client = await createAuth0Client({
    domain,
    clientId,
    authorizationParams: {
      redirect_uri: redirectUri,
      audience: audience || undefined,
      scope,
    },
    cacheLocation: 'localstorage',
  });

  if (isAuthRedirect()) {
    const result = await client.handleRedirectCallback();
    const targetUrl =
      typeof result.appState?.targetUrl === 'string'
        ? result.appState.targetUrl
        : globalThis.location.pathname;

    globalThis.history.replaceState({}, document.title, targetUrl);
  }

  let state: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    authUser: undefined,
  };

  const listeners = new Set<() => void>();

  function setState(nextState: AuthState): void {
    state = nextState;
    listeners.forEach((listener) => listener());
  }

  async function refreshAuthState(): Promise<void> {
    setState({ ...state, isLoading: true });

    try {
      const isAuthenticated = await client.isAuthenticated();
      const user = isAuthenticated ? await client.getUser() : undefined;

      setState({
        isAuthenticated,
        isLoading: false,
        authUser: readAuthUser(user),
      });
    } catch (error) {
      console.error(error);
      setState({
        isAuthenticated: false,
        isLoading: false,
        authUser: undefined,
      });
    }
  }

  await refreshAuthState();

  return {
    getState(): AuthState {
      return state;
    },

    subscribe(onStoreChange: () => void): () => void {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },

    async getAccessToken(
      _permissions: readonly Permission[],
    ): Promise<string | undefined> {
      // Empty permissionsRequired still means an authenticated user; always fetch a token.
      try {
        return await client.getTokenSilently();
      } catch (error) {
        console.error(error);
        return undefined;
      }
    },

    login(): void {
      client.loginWithRedirect({
        appState: { targetUrl: globalThis.location.pathname },
      });
    },

    logout(): void {
      client.logout({
        logoutParams: { returnTo: globalThis.location.origin },
      });
    },
  };
}
