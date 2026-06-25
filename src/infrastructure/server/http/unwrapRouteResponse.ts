import { RouteResponseError } from '@ports';
import type { ErrorResponse, Response200, Response201 } from './responseTypes';

/**
 * Last HTTP-layer step before data reaches application ports.
 *
 * Resources return typed envelopes (`{ data }` or `{ message, statusCode }`) so
 * route failures stay explicit without throwing through callers. Adapters call
 * these helpers to convert envelopes into plain domain values or a single
 * {@link RouteResponseError} at the port boundary.
 */

function isErrorResponse(
  response: Response200<unknown> | Response201<unknown>,
): response is ErrorResponse {
  return 'message' in response;
}

function unwrapEnvelope<T>(response: Response200<T> | Response201<T>): T {
  if (isErrorResponse(response)) {
    throw new RouteResponseError(response.message, response.statusCode);
  }

  return response.data;
}

/** Unwrap a 200-envelope promise (GET, POST, PUT, PATCH, media POST). */
export async function unwrapRouteResponsePromise<T>(
  responsePromise: Promise<Response200<T>>,
): Promise<T> {
  return unwrapEnvelope(await responsePromise);
}

/** Unwrap a 201-envelope promise (created POST). */
export async function unwrapCreatedRouteResponsePromise<T>(
  responsePromise: Promise<Response201<T>>,
): Promise<T> {
  return unwrapEnvelope(await responsePromise);
}

/** Unwrap a DELETE promise (204 success returns undefined). */
export async function unwrapDeleteRouteResponsePromise(
  responsePromise: Promise<ErrorResponse | undefined>,
): Promise<void> {
  const response = await responsePromise;

  if (response !== undefined) {
    throw new RouteResponseError(response.message, response.statusCode);
  }
}
