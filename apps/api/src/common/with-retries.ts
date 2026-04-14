export async function withRetries<T>(
  operation: () => Promise<T>,
  options: {
    retries?: number;
    delayMs?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {},
) {
  const retries = options.retries ?? 2;
  const delayMs = options.delayMs ?? 250;
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }

      attempt += 1;
      options.onRetry?.(attempt, error);
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}
