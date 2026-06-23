import type { Permission } from '@classicalmoser/prevail-contracts';

export interface AuthUser {
  email: string;
  roles: readonly string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | undefined;
}

export type AccessTokenGetter = (
  permissions: readonly Permission[],
) => Promise<string | undefined>;

/** Outbound port for authentication and access tokens. */
export interface AuthPort {
  getState(): AuthState;
  subscribe(onStoreChange: () => void): () => void;
  getAccessToken: AccessTokenGetter;
  login(): void;
  logout(): void;
}
