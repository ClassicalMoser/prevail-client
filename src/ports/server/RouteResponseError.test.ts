import { describe, expect, it } from 'vite-plus/test';
import {
  createRouteResponseError,
  isRouteResponseError,
} from './RouteResponseError';

describe('route response error', () => {
  it('carries the HTTP status on the error', () => {
    expect.hasAssertions();
    const error = createRouteResponseError('missing', 404);

    expect(error.message).toBe('missing');
    expect(error.name).toBe('RouteResponseError');
    expect(error.statusCode).toBe(404);
    expect(isRouteResponseError(error)).toBe(true);
  }, 1000);

  it('rejects a plain Error', () => {
    expect.hasAssertions();
    const error = new Error('missing');

    expect(isRouteResponseError(error)).toBe(false);
  }, 1000);
});
