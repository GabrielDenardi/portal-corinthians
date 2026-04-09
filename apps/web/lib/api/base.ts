import "server-only";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:4000";

export function getApiBaseUrl() {
  return process.env.PORTAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
}

export async function fetchApiJson<T>(path: string, revalidate: number) {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: {
        accept: "application/json",
      },
      next: { revalidate },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}
