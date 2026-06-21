import { createDeleteCaller } from './createDeleteCaller';
import { createGetCaller } from './createGetCaller';
import { createPatchCaller } from './createPatchCaller';
import { createPostCaller } from './createPostCaller';
import { createPutCaller } from './createPutCaller';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:7412';

const callGet = createGetCaller({ serverUrl: SERVER_URL });
const callDelete = createDeleteCaller({ serverUrl: SERVER_URL });
const callPost = createPostCaller({ serverUrl: SERVER_URL });
const callPut = createPutCaller({ serverUrl: SERVER_URL });
const callPatch = createPatchCaller({ serverUrl: SERVER_URL });

export { callDelete, callGet, callPatch, callPost, callPut };
