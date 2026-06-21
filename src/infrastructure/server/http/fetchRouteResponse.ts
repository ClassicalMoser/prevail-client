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
  RouteAuth,
} from '@classicalmoser/prevail-contracts';
import type {
  CreatedPostResponse,
  ErrorResponse,
  GetResponse,
  MediaPostResponse,
  PatchResponse,
  PostResponse,
  PutResponse,
  SuccessResponse200,
  SuccessResponse201,
} from './responseTypes';

function hasStringMessage(json: unknown): json is { message: string } {
  return (
    typeof json === 'object' &&
    json !== null &&
    'message' in json &&
    typeof json.message === 'string'
  );
}

function parseErrorMessage(json: unknown): string {
  if (hasStringMessage(json)) {
    return json.message;
  }

  throw new Error('Invalid error response body');
}

async function sendRouteRequest(
  url: string,
  auth: RouteAuth,
  init: RequestInit,
): Promise<Response> {
  const requestInit: RequestInit = { ...init };

  if (auth.authRequired) {
    requestInit.credentials = 'include';
  }

  return fetch(url, requestInit);
}

async function parseRouteEnvelope200<
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  response: Response,
  route:
    | GetRoute<TParams, TQuery, TData>
    | PostRoute<TParams, TQuery, unknown, TData>
    | PutRoute<TParams, TQuery, unknown, TData>
    | PatchRoute<TParams, TQuery, unknown, TData>,
): Promise<SuccessResponse200<TData> | ErrorResponse> {
  if (response.ok) {
    const json: unknown = await response.json();
    const data = route.validators.data.parse(json);
    return { data, statusCode: 200 };
  }

  const json: unknown = await response.json();
  return { message: parseErrorMessage(json), statusCode: response.status };
}

async function parseRouteEnvelope201<
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  response: Response,
  route: CreatedPostRoute<TParams, TQuery, unknown, TData>,
): Promise<SuccessResponse201<TData> | ErrorResponse> {
  if (response.ok) {
    const json: unknown = await response.json();
    const data = route.validators.data.parse(json);
    return { data, statusCode: 201 };
  }

  const json: unknown = await response.json();
  return { message: parseErrorMessage(json), statusCode: response.status };
}

export async function fetchGetResponse<
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  url: string,
  route: GetRoute<TParams, TQuery, TData>,
): Promise<GetResponse<TData>> {
  const response = await sendRouteRequest(url, route.auth, { method: 'GET' });
  return parseRouteEnvelope200(response, route);
}

export async function fetchDeleteResponse<
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  url: string,
  route: DeleteRoute<TParams, TQuery>,
): Promise<ErrorResponse | undefined> {
  const response = await sendRouteRequest(url, route.auth, {
    method: 'DELETE',
  });

  if (response.status === 204) {
    return undefined;
  }

  const json: unknown = await response.json();
  return { message: parseErrorMessage(json), statusCode: response.status };
}

export async function fetchPostResponse<
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  url: string,
  route: PostRoute<TParams, TQuery, TBody, TData>,
  body: TBody,
): Promise<PostResponse<TData>> {
  const response = await sendRouteRequest(url, route.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return parseRouteEnvelope200(response, route);
}

export async function fetchCreatedPostResponse<
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  url: string,
  route: CreatedPostRoute<TParams, TQuery, TBody, TData>,
  body: TBody,
): Promise<CreatedPostResponse<TData>> {
  const response = await sendRouteRequest(url, route.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return parseRouteEnvelope201(response, route);
}

function isMediaPayload(
  result: MediaPayload<MediaContentType> | ErrorResponse,
): result is MediaPayload<MediaContentType> {
  return typeof result === 'string' || result instanceof Uint8Array;
}

async function parseMediaPayload<TContentType extends MediaContentType>(
  response: Response,
  contentType: TContentType,
): Promise<MediaPayload<TContentType> | ErrorResponse> {
  const responseContentType = response.headers.get('content-type');

  if (!responseContentType?.startsWith(contentType)) {
    return {
      message: 'Unexpected response content type',
      statusCode: response.status,
    };
  }

  let payload: MediaPayload<TContentType>;

  switch (contentType) {
    case 'image/svg+xml': {
      payload = (await response.text()) as MediaPayload<TContentType>;
      break;
    }
    case 'application/pdf':
    case 'image/png': {
      const buffer = await response.arrayBuffer();
      payload = new Uint8Array(buffer) as MediaPayload<TContentType>;
      break;
    }
    default: {
      const exhaustiveCheck: never = contentType;
      throw new Error(`Unsupported media content type: ${exhaustiveCheck}`);
    }
  }

  if (
    (typeof payload === 'string' && payload.length === 0) ||
    (payload instanceof Uint8Array && payload.length === 0)
  ) {
    return {
      message: 'Empty media response',
      statusCode: response.status,
    };
  }

  return payload;
}

export async function fetchMediaPostResponse<
  TContentType extends MediaContentType,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  url: string,
  route: MediaPostRoute<TParams, TQuery, TBody, TContentType>,
  body: TBody,
): Promise<MediaPostResponse<MediaPayload<TContentType>>> {
  const response = await sendRouteRequest(url, route.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    const result = await parseMediaPayload(response, route.successContentType);

    if (!isMediaPayload(result)) {
      return result;
    }

    return { data: result, statusCode: 200 };
  }

  const json: unknown = await response.json();
  return { message: parseErrorMessage(json), statusCode: response.status };
}

export async function fetchPutResponse<
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  url: string,
  route: PutRoute<TParams, TQuery, TBody, TData>,
  body: TBody,
): Promise<PutResponse<TData>> {
  const response = await sendRouteRequest(url, route.auth, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return parseRouteEnvelope200(response, route);
}

export async function fetchPatchResponse<
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  url: string,
  route: PatchRoute<TParams, TQuery, TBody, TData>,
  body: TBody,
): Promise<PatchResponse<TData>> {
  const response = await sendRouteRequest(url, route.auth, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return parseRouteEnvelope200(response, route);
}
