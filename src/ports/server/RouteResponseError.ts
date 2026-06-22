/** Thrown when a server port operation receives an HTTP error response. */
export class RouteResponseError extends Error {
  public readonly statusCode: number;

  public constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'RouteResponseError';
    this.statusCode = statusCode;
  }
}
