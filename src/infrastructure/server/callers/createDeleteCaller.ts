import type { DeleteRoute } from '@classicalmoser/prevail-contracts';
import type { ErrorResponse, RouteCallArgs } from '../http';
import { buildRequestUrl, fetchDeleteResponse } from '../http';

interface DeleteCallerConfig {
  serverUrl: string;
}

export function createDeleteCaller({ serverUrl }: DeleteCallerConfig) {
  return async function callDelete<
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
  >(
    route: DeleteRoute<TParams, TQuery>,
    args: RouteCallArgs<TParams, TQuery>,
  ): Promise<ErrorResponse | undefined> {
    const url = buildRequestUrl(serverUrl, route.path, args.params, args.query);

    return fetchDeleteResponse(url, route);
  };
}
