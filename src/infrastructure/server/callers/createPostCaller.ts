import type {
  CreatedPostRoute,
  PostRoute,
} from '@classicalmoser/prevail-contracts';
import { buildRequestUrl } from '../http';
import type {
  BodyRouteCallArgs,
  CreatedPostResponse,
  PostResponse,
} from '../http';
import type { CallerDependencies } from './callerDependencies';

interface CallPost {
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
function createPostCaller({
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
    const url = buildRequestUrl(serverUrl, {
      path: route.path,
      params: args.params,
      query: args.query,
    });

    if (route.successStatus === 201) {
      return routeFetch.fetchCreatedPostResponse(url, route, args.body);
    }

    return routeFetch.fetchPostResponse(url, route, args.body);
  }

  return callPost;
}

export { type CallPost, createPostCaller };
