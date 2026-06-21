interface RouteCallArgs<
  P extends Record<string, unknown>,
  Q extends Record<string, unknown>,
> {
  params: P;
  query: Q;
}

type BodyRouteCallArgs<
  P extends Record<string, unknown>,
  Q extends Record<string, unknown>,
  B,
> = RouteCallArgs<P, Q> & { body: B };

export type { BodyRouteCallArgs, RouteCallArgs };
