export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN ?? '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID ?? '',
  audience: import.meta.env.VITE_AUTH0_AUDIENCE ?? '',
  redirectUri:
    import.meta.env.VITE_AUTH0_REDIRECT_URI ?? globalThis.location.origin,
  scope: 'openid profile email',
} as const;
