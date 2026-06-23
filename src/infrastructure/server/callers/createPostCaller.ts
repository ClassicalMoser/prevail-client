import type {
  CreatedPostRoute,
  PostRoute,
} from '@classicalmoser/prevail-contracts';
import type {
  BodyRouteCallArgs,
  CreatedPostResponse,
  PostResponse,
} from '../http';
import { buildRequestUrl } from '../http';
import type { CallerDependencies } from './callerDependencies';

export interface CallPost {
  <
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    route: PostRoute<TParams, TQuery, TBody, TData>,
    args: BodyRouteCallArgs<TParams, TQuery, TBody>,
  ): Promise<PostResponse<TData>>;
  <
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    route: CreatedPostRoute<TParams, TQuery, TBody, TData>,
    args: BodyRouteCallArgs<TParams, TQuery, TBody>,
  ): Promise<CreatedPostResponse<TData>>;
}

/** POST caller: picks 200 vs 201 fetch based on contract `successStatus`. */
export function createPostCaller({
  serverUrl,
  routeFetch,
}: CallerDependencies): CallPost {
  async function callPost<
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    route: PostRoute<TParams, TQuery, TBody, TData>,
    args: BodyRouteCallArgs<TParams, TQuery, TBody>,
  ): Promise<PostResponse<TData>>;

  async function callPost<
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    route: CreatedPostRoute<TParams, TQuery, TBody, TData>,
    args: BodyRouteCallArgs<TParams, TQuery, TBody>,
  ): Promise<CreatedPostResponse<TData>>;

  async function callPost<
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    route:
      | PostRoute<TParams, TQuery, TBody, TData>
      | CreatedPostRoute<TParams, TQuery, TBody, TData>,
    args: BodyRouteCallArgs<TParams, TQuery, TBody>,
  ): Promise<PostResponse<TData> | CreatedPostResponse<TData>> {
    const url = buildRequestUrl(serverUrl, route.path, args.params, args.query);

    if (route.successStatus === 201) {
      return routeFetch.fetchCreatedPostResponse(url, route, args.body);
    }

    return routeFetch.fetchPostResponse(url, route, args.body);
  }

  return callPost;
}
