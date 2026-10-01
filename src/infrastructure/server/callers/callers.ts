import type { RouteFetch } from '../http';
import type { CallerDependencies } from './callerDependencies';
import { createDeleteCaller } from './createDeleteCaller';
import type { CallDelete } from './createDeleteCaller';
import { createGetCaller } from './createGetCaller';
import type { CallGet } from './createGetCaller';
import { createMediaPostCaller } from './createMediaPostCaller';
import type { CallMediaPost } from './createMediaPostCaller';
import { createPatchCaller } from './createPatchCaller';
import type { CallPatch } from './createPatchCaller';
import { createPostCaller } from './createPostCaller';
import type { CallPost } from './createPostCaller';
import { createPutCaller } from './createPutCaller';
import type { CallPut } from './createPutCaller';

interface Callers {
  callDelete: CallDelete;
  callGet: CallGet;
  callMediaPost: CallMediaPost;
  callPatch: CallPatch;
  callPost: CallPost;
  callPut: CallPut;
}

/**
 * HTTP verb facades used by resources.
 * Each caller turns a contract + args into a URL, then delegates to {@link RouteFetch}.
 */
function createCallers(serverUrl: string, routeFetch: RouteFetch): Callers {
  const deps: CallerDependencies = { serverUrl, routeFetch };

  return {
    callDelete: createDeleteCaller(deps),
    callGet: createGetCaller(deps),
    callMediaPost: createMediaPostCaller(deps),
    callPatch: createPatchCaller(deps),
    callPost: createPostCaller(deps),
    callPut: createPutCaller(deps),
  };
}

export { type CallerDependencies, type Callers, createCallers };
