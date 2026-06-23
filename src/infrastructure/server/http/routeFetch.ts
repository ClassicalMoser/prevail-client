import type {
  CreatedPostRoute,
  DeleteRoute,
  GetRoute,
  MediaContentType,
  MediaPayload,
  MediaPostRoute,
  PatchRoute,
  PostRoute,
  PutRoute,
} from '@classicalmoser/prevail-contracts';
import type {
  CreatedPostResponse,
  ErrorResponse,
  GetResponse,
  MediaPostResponse,
  PatchResponse,
  PostResponse,
  PutResponse,
} from './responseTypes';

/**
 * Injectable HTTP transport for prevail-contracts routes.
 *
 * Implemented by {@link createRouteFetch}. Callers depend on this interface —
 * not on `fetch` or auth — so tests can substitute fakes without network I/O.
 */
export interface RouteFetch {
  fetchGetResponse: <
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
  >(
    url: string,
    route: GetRoute<TParams, TQuery, TData>,
  ) => Promise<GetResponse<TData>>;
  fetchDeleteResponse: <
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
  >(
    url: string,
    route: DeleteRoute<TParams, TQuery>,
  ) => Promise<ErrorResponse | undefined>;
  fetchPostResponse: <
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    url: string,
    route: PostRoute<TParams, TQuery, TBody, TData>,
    body: TBody,
  ) => Promise<PostResponse<TData>>;
  fetchCreatedPostResponse: <
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    url: string,
    route: CreatedPostRoute<TParams, TQuery, TBody, TData>,
    body: TBody,
  ) => Promise<CreatedPostResponse<TData>>;
  fetchMediaPostResponse: <
    TContentType extends MediaContentType,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    url: string,
    route: MediaPostRoute<TParams, TQuery, TBody, TContentType>,
    body: TBody,
  ) => Promise<MediaPostResponse<MediaPayload<TContentType>>>;
  fetchPutResponse: <
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    url: string,
    route: PutRoute<TParams, TQuery, TBody, TData>,
    body: TBody,
  ) => Promise<PutResponse<TData>>;
  fetchPatchResponse: <
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    url: string,
    route: PatchRoute<TParams, TQuery, TBody, TData>,
    body: TBody,
  ) => Promise<PatchResponse<TData>>;
}
