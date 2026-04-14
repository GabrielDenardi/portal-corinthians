import "server-only";

import { getAdminToken } from "@/lib/auth";

import { fetchApiJson } from "./base";

export async function fetchAdminApi<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    cache?: RequestCache;
  } = {},
) {
  const token = await getAdminToken();

  if (!token) {
    return null;
  }

  return fetchApiJson<T>(path, {
    method: options.method,
    cache: options.cache ?? "no-store",
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      "content-type": "application/json",
      "x-admin-session": token,
    },
  });
}
