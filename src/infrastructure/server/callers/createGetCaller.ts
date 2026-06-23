import type { GetRoute } from '@classicalmoser/prevail-contracts';
import type { GetResponse, RouteCallArgs } from '../http';
import { buildRequestUrl } from '../http';
import type { CallerDependencies } from './callerDependencies';

export type CallGet = <
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  route: GetRoute<TParams, TQuery, TData>,
  args: RouteCallArgs<TParams, TQuery>,
) => Promise<GetResponse<TData>>;

/** GET caller: URL assembly only; transport lives in {@link RouteFetch}. */
export function createGetCaller({
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
    const url = buildRequestUrl(serverUrl, route.path, args.params, args.query);

    return routeFetch.fetchGetResponse(url, route);
  };
}
