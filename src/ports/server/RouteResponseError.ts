/**
 * Thrown when a server port operation receives an HTTP error response.
 * A plain `Error` with `statusCode`. Identify it with {@link isRouteResponseError}.
 */
interface RouteResponseError extends Error {
  readonly statusCode: number;
}

/**
 * Build the error a server adapter throws at the port boundary.
 * `statusCode` is the HTTP status. The message is the route's error text.
 */
function createRouteResponseError(
  message: string,
  statusCode: number,
): RouteResponseError {
  const error = new Error(message);
  error.name = 'RouteResponseError';
  const routeError: RouteResponseError = Object.assign(error, { statusCode });
  return routeError;
}

/** True when `error` was built by {@link createRouteResponseError}. */
function isRouteResponseError(error: unknown): error is RouteResponseError {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name !== 'RouteResponseError') {
    return false;
  }
  if (!('statusCode' in error)) {
    return false;
  }
  const statusCode = error.statusCode;
  return typeof statusCode === 'number';
}

export {
  type RouteResponseError,
  createRouteResponseError,
  isRouteResponseError,
};
