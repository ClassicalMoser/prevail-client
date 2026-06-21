import type { PatchRoute } from '@classicalmoser/prevail-contracts';
import { buildRequestUrl, fetchPatchResponse } from '../http';
import type { BodyRouteCallArgs, PatchResponse } from '../http';

interface PatchCallerConfig {
  serverUrl: string;
}

export function createPatchCaller({ serverUrl }: PatchCallerConfig) {
  return async function callPatch<
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    route: PatchRoute<TParams, TQuery, TBody, TData>,
    args: BodyRouteCallArgs<TParams, TQuery, TBody>,
  ): Promise<PatchResponse<TData>> {
    const url = buildRequestUrl(serverUrl, route.path, args.params, args.query);

    return fetchPatchResponse(url, route, args.body);
  };
}
