import { RouteResponseError } from '@ports';
import type { ErrorResponse, Response200, Response201 } from './responseTypes';

function isErrorResponse(
  response: Response200<unknown> | Response201<unknown>,
): response is ErrorResponse {
  return 'message' in response;
}

function unwrapRouteResponse<T>(response: Response200<T>): T {
  if (isErrorResponse(response)) {
    throw new RouteResponseError(response.message, response.statusCode);
  }

  return response.data;
}

function unwrapCreatedRouteResponse<T>(response: Response201<T>): T {
  if (isErrorResponse(response)) {
    throw new RouteResponseError(response.message, response.statusCode);
  }

  return response.data;
}

export async function unwrapRouteResponsePromise<T>(
  responsePromise: Promise<Response200<T>>,
): Promise<T> {
  return unwrapRouteResponse(await responsePromise);
}

export async function unwrapCreatedRouteResponsePromise<T>(
  responsePromise: Promise<Response201<T>>,
): Promise<T> {
  return unwrapCreatedRouteResponse(await responsePromise);
}
