import type {
  CreatedPostRoute,
  PostRoute,
} from '@classicalmoser/prevail-contracts';
import {
  buildRequestUrl,
  fetchCreatedPostResponse,
  fetchPostResponse,
} from '../http';
import type {
  BodyRouteCallArgs,
  CreatedPostResponse,
  PostResponse,
} from '../http';

interface PostCallerConfig {
  serverUrl: string;
}

interface PostCaller {
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

export function createPostCaller({ serverUrl }: PostCallerConfig): PostCaller {
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
      return fetchCreatedPostResponse(url, route, args.body);
    }

    return fetchPostResponse(url, route, args.body);
  }

  return callPost;
}
