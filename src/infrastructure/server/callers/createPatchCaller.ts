import type { PatchRoute } from '@classicalmoser/prevail-contracts';
import { buildRequestUrl } from '../http';
import type { BodyRouteCallArgs, PatchResponse } from '../http';
import type { CallerDependencies } from './callerDependencies';

type CallPatch = <
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  route: PatchRoute<TParams, TQuery, TBody, TData>,
  args: BodyRouteCallArgs<TParams, TQuery, TBody>,
) => Promise<PatchResponse<TData>>;

function createPatchCaller({
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
    const url = buildRequestUrl(serverUrl, {
      path: route.path,
      params: args.params,
      query: args.query,
    });

    return routeFetch.fetchPatchResponse(url, route, args.body);
  };
}

export { type CallPatch, createPatchCaller };
