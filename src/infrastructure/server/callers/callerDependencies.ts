import type { RouteFetch } from '../http';

/** Shared deps for all verb callers — one {@link RouteFetch} instance, one base URL. */
export interface CallerDependencies {
  serverUrl: string;
  routeFetch: RouteFetch;
}
