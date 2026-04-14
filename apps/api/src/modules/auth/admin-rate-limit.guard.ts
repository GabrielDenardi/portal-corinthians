import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";

const requestBuckets = new Map<string, { count: number; expiresAt: number }>();

@Injectable()
export class AdminRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      ip?: string;
      headers: Record<string, string | string[] | undefined>;
      route?: { path?: string };
      method?: string;
    }>();

    const forwarded = request.headers["x-forwarded-for"];
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded ?? request.ip ?? "unknown";
    const key = `${ip}:${request.method ?? "GET"}:${request.route?.path ?? "route"}`;
    const now = Date.now();
    const bucket = requestBuckets.get(key);

    if (!bucket || bucket.expiresAt <= now) {
      requestBuckets.set(key, { count: 1, expiresAt: now + 60_000 });
      return true;
    }

    if (bucket.count >= 60) {
      throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
    }

    bucket.count += 1;
    requestBuckets.set(key, bucket);
    return true;
  }
}
