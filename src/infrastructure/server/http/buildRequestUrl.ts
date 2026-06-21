function buildPath(template: string, params: Record<string, unknown>): string {
  return Object.entries(params).reduce(
    (path, [key, value]) =>
      path.replace(`:${key}`, encodeURIComponent(String(value))),
    template,
  );
}

function buildQueryString(query: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs.length > 0 ? `?${qs}` : '';
}

export function buildRequestUrl(
  serverUrl: string,
  routePath: string,
  params: Record<string, unknown>,
  query: Record<string, unknown>,
): string {
  const path = buildPath(routePath, params);
  return `${serverUrl.replace(/\/$/u, '')}/api${path}${buildQueryString(query)}`;
}
