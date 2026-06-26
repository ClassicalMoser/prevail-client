import type { AuthPort, ServerPorts } from '@ports';
import { createAuth0Port, createServerPorts } from '@infrastructure';

export interface AppDependencies {
  authPort: AuthPort;
  serverPorts: ServerPorts;
}

let dependencies: AppDependencies | undefined;

/**
 * Build the session-stable port singletons exactly once, before the app renders.
 * The async auth port is resolved here at the composition root rather than inside
 * the component tree, so the rest of the app consumes plain (non-reactive) singletons.
 */
export async function initializeAppDependencies(): Promise<AppDependencies> {
  const authPort = await createAuth0Port();
  const serverPorts = createServerPorts((permissions) =>
    authPort.getAccessToken(permissions),
  );

  dependencies = { authPort, serverPorts };
  return dependencies;
}

/** Read the singletons built by {@link initializeAppDependencies}. */
export function appDependencies(): AppDependencies {
  if (dependencies === undefined) {
    throw new Error(
      'App dependencies accessed before initializeAppDependencies() resolved.',
    );
  }

  return dependencies;
}
