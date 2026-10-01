import type { GetRoute } from '@classicalmoser/prevail-contracts';
import { buildRequestUrl } from '../http';
import type { GetResponse, RouteCallArgs } from '../http';
import type { CallerDependencies } from './callerDependencies';

type CallGet = <
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  route: GetRoute<TParams, TQuery, TData>,
  args: RouteCallArgs<TParams, TQuery>,
) => Promise<GetResponse<TData>>;

/** GET caller: URL assembly only; transport lives in {@link RouteFetch}. */
function createGetCaller({
  serverUrl,
  routeFetch,
}: CallerDependencies): CallGet {
  return async function callGet<
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
  >(
    route: GetRoute<TParams, TQuery, TData>,
    args: RouteCallArgs<TParams, TQuery>,
  ): Promise<GetResponse<TData>> {
    const url = buildRequestUrl(serverUrl, {
      path: route.path,
      params: args.params,
      query: args.query,
    });

    return routeFetch.fetchGetResponse(url, route);
  };
}

export { type CallGet, createGetCaller };
