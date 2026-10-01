import type { AuthPort, ServerPorts } from '@ports';
import { createAuth0Port, createServerPorts } from '@infrastructure';

interface AppDependencies {
  authPort: AuthPort;
  serverPorts: ServerPorts;
}

const dependencyHolder: { value?: AppDependencies } = {};

/**
 * Build the session-stable port singletons exactly once, before the app renders.
 * The async auth port is resolved here at the composition root rather than inside
 * the component tree, so the rest of the app consumes plain (non-reactive) singletons.
 */
async function initializeAppDependencies(): Promise<AppDependencies> {
  const authPort = await createAuth0Port();
  const serverPorts = createServerPorts((permissions) =>
    authPort.getAccessToken(permissions),
  );

  const dependencies = { authPort, serverPorts };
  dependencyHolder.value = dependencies;
  return dependencies;
}

/** Read the singletons built by {@link initializeAppDependencies}. */
function appDependencies(): AppDependencies {
  const dependencies = dependencyHolder.value;
  if (dependencies === undefined) {
    throw new Error(
      'App dependencies accessed before initializeAppDependencies() resolved.',
    );
  }

  return dependencies;
}

export { type AppDependencies, initializeAppDependencies, appDependencies };
