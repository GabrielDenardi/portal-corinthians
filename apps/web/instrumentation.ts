import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const message = error instanceof Error ? error.message : String(error);
  const digest =
    typeof error === "object" && error && "digest" in error ? `${(error as { digest?: string }).digest ?? ""}` : "";

  console.error(
    JSON.stringify({
      level: "error",
      scope: "web-request",
      message,
      path: request.path,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
      digest,
    }),
  );
};
