import type {
  MediaContentType,
  MediaPayload,
  MediaPostRoute,
} from '@classicalmoser/prevail-contracts';
import { buildRequestUrl, fetchMediaPostResponse } from '../http';
import type { BodyRouteCallArgs, MediaPostResponse } from '../http';

interface MediaPostCallerConfig {
  serverUrl: string;
}

export function createMediaPostCaller({ serverUrl }: MediaPostCallerConfig) {
  return async function callMediaPost<
    TContentType extends MediaContentType,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    route: MediaPostRoute<TParams, TQuery, TBody, TContentType>,
    args: BodyRouteCallArgs<TParams, TQuery, TBody>,
  ): Promise<MediaPostResponse<MediaPayload<TContentType>>> {
    const url = buildRequestUrl(serverUrl, route.path, args.params, args.query);

    return fetchMediaPostResponse(url, route, args.body);
  };
}
