import type { RouteFetch } from '../http';
import type { CallerDependencies } from './callerDependencies';
import type { CallDelete } from './createDeleteCaller';
import type { CallGet } from './createGetCaller';
import type { CallMediaPost } from './createMediaPostCaller';
import type { CallPatch } from './createPatchCaller';
import type { CallPost } from './createPostCaller';
import type { CallPut } from './createPutCaller';
import { createDeleteCaller } from './createDeleteCaller';
import { createGetCaller } from './createGetCaller';
import { createMediaPostCaller } from './createMediaPostCaller';
import { createPatchCaller } from './createPatchCaller';
import { createPostCaller } from './createPostCaller';
import { createPutCaller } from './createPutCaller';

export type { CallerDependencies } from './callerDependencies';

export interface Callers {
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
export function createCallers(
  serverUrl: string,
  routeFetch: RouteFetch,
): Callers {
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
