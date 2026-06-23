import type { DeleteRoute } from '@classicalmoser/prevail-contracts';
import type { ErrorResponse, RouteCallArgs } from '../http';
import { buildRequestUrl } from '../http';
import type { CallerDependencies } from './callerDependencies';

export type CallDelete = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  route: DeleteRoute<TParams, TQuery>,
  args: RouteCallArgs<TParams, TQuery>,
) => Promise<ErrorResponse | undefined>;

/** DELETE caller: URL assembly only; transport lives in {@link RouteFetch}. */
export function createDeleteCaller({
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
    const url = buildRequestUrl(serverUrl, route.path, args.params, args.query);

    return routeFetch.fetchDeleteResponse(url, route);
  };
}
