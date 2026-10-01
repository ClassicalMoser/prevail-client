import type { DeleteRoute } from '@classicalmoser/prevail-contracts';
import { buildRequestUrl } from '../http';
import type { ErrorResponse, RouteCallArgs } from '../http';
import type { CallerDependencies } from './callerDependencies';

type CallDelete = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  route: DeleteRoute<TParams, TQuery>,
  args: RouteCallArgs<TParams, TQuery>,
) => Promise<ErrorResponse | undefined>;

/** DELETE caller: URL assembly only; transport lives in {@link RouteFetch}. */
function createDeleteCaller({
  serverUrl,
  routeFetch,
}: CallerDependencies): CallDelete {
  return async function callDelete<
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
  >(
    route: DeleteRoute<TParams, TQuery>,
    args: RouteCallArgs<TParams, TQuery>,
  ): Promise<ErrorResponse | undefined> {
    const url = buildRequestUrl(serverUrl, {
      path: route.path,
      params: args.params,
      query: args.query,
    });

    return routeFetch.fetchDeleteResponse(url, route);
  };
}

export { type CallDelete, createDeleteCaller };
