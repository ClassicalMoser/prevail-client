import type {
  MediaContentType,
  MediaPayload,
  MediaPostRoute,
} from '@classicalmoser/prevail-contracts';
import type { BodyRouteCallArgs, MediaPostResponse } from '../http';
import { buildRequestUrl } from '../http';
import type { CallerDependencies } from './callerDependencies';

export type CallMediaPost = <
  TContentType extends MediaContentType,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  route: MediaPostRoute<TParams, TQuery, TBody, TContentType>,
  args: BodyRouteCallArgs<TParams, TQuery, TBody>,
) => Promise<MediaPostResponse<MediaPayload<TContentType>>>;

/** Media POST caller: JSON body in, typed binary/text payload out. */
export function createMediaPostCaller({
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
    const url = buildRequestUrl(serverUrl, route.path, args.params, args.query);

    return routeFetch.fetchMediaPostResponse(url, route, args.body);
  };
}
