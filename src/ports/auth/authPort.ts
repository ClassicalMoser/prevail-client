import type { Permission } from '@classicalmoser/prevail-contracts';

/** The signed-in user the auth port is willing to show the UI. */
interface AuthUser {
  email: string;
  roles: readonly string[];
}

/**
 * Session snapshot.
 * `authUser` is absent until a session exists. `isLoading` covers the first resolution.
 */
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | undefined;
}

/**
 * Ask the auth adapter for an access token that includes `permissions`.
 * Resolves `undefined` when no session can produce a token.
 */
type AccessTokenGetter = (
  permissions: readonly Permission[],
) => Promise<string | undefined>;

/** Outbound port for authentication and access tokens. */
interface AuthPort {
  /** Read the current session. Does not subscribe. */
  getState(): AuthState;
  /** Listen for session changes. The return value unsubscribes. */
  subscribe(onStoreChange: () => void): () => void;
  getAccessToken: AccessTokenGetter;
  /** Start the interactive login. */
  login(): void;
  /** End the session. */
  logout(): void;
}

export type { AuthUser, AuthState, AccessTokenGetter, AuthPort };
