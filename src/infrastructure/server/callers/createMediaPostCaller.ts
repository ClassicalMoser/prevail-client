import type {
  MediaContentType,
  MediaPayload,
  MediaPostRoute,
} from '@classicalmoser/prevail-contracts';
import { buildRequestUrl } from '../http';
import type { BodyRouteCallArgs, MediaPostResponse } from '../http';
import type { CallerDependencies } from './callerDependencies';

type CallMediaPost = <
  TContentType extends MediaContentType,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  route: MediaPostRoute<TParams, TQuery, TBody, TContentType>,
  args: BodyRouteCallArgs<TParams, TQuery, TBody>,
) => Promise<MediaPostResponse<MediaPayload<TContentType>>>;

/** Media POST caller: JSON body in, typed binary/text payload out. */
function createMediaPostCaller({
  serverUrl,
  routeFetch,
}: CallerDependencies): CallMediaPost {
  return async function callMediaPost<
    TContentType extends MediaContentType,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    route: MediaPostRoute<TParams, TQuery, TBody, TContentType>,
    args: BodyRouteCallArgs<TParams, TQuery, TBody>,
  ): Promise<MediaPostResponse<MediaPayload<TContentType>>> {
    const url = buildRequestUrl(serverUrl, {
      path: route.path,
      params: args.params,
      query: args.query,
    });

    return routeFetch.fetchMediaPostResponse(url, route, args.body);
  };
}

export { type CallMediaPost, createMediaPostCaller };
