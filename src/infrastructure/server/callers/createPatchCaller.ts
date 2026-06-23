import type { PatchRoute } from '@classicalmoser/prevail-contracts';
import type { BodyRouteCallArgs, PatchResponse } from '../http';
import { buildRequestUrl } from '../http';
import type { CallerDependencies } from './callerDependencies';

export type CallPatch = <
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  route: PatchRoute<TParams, TQuery, TBody, TData>,
  args: BodyRouteCallArgs<TParams, TQuery, TBody>,
) => Promise<PatchResponse<TData>>;

export function createPatchCaller({
  serverUrl,
  routeFetch,
}: CallerDependencies): CallPatch {
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

    return routeFetch.fetchPatchResponse(url, route, args.body);
  };
}
