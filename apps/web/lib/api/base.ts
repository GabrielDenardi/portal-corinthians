import "server-only";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:4000";

export function getApiBaseUrl() {
  return process.env.PORTAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
}

export async function fetchApiJson<T>(
  path: string,
  options: {
    revalidate?: number;
    tags?: string[];
    headers?: HeadersInit;
    method?: string;
    body?: BodyInit;
    cache?: RequestCache;
  } = {},
) {
  const { revalidate, tags, headers, method, body, cache } = options;

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      body,
      headers: {
        accept: "application/json",
        ...headers,
      },
      ...(cache ? { cache } : {}),
      ...(revalidate || tags?.length ? { next: { revalidate, tags } } : {}),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}
