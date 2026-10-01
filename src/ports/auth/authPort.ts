import type { Permission } from '@classicalmoser/prevail-contracts';

interface AuthUser {
  email: string;
  roles: readonly string[];
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | undefined;
}

type AccessTokenGetter = (
  permissions: readonly Permission[],
) => Promise<string | undefined>;

/** Outbound port for authentication and access tokens. */
interface AuthPort {
  getState(): AuthState;
  subscribe(onStoreChange: () => void): () => void;
  getAccessToken: AccessTokenGetter;
  login(): void;
  logout(): void;
}

export type { AuthUser, AuthState, AccessTokenGetter, AuthPort };
