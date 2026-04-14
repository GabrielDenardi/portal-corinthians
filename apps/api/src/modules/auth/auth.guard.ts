import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      authSession?: Awaited<ReturnType<AuthService["getSessionFromToken"]>>;
    }>();

    const token = readToken(request.headers);

    if (!token) {
      throw new UnauthorizedException("Missing session token");
    }

    request.authSession = await this.authService.getSessionFromToken(token);
    return true;
  }
}

function readToken(headers: Record<string, string | string[] | undefined>) {
  const direct = headers["x-admin-session"];

  if (typeof direct === "string" && direct.length > 0) {
    return direct;
  }

  const authHeader = headers.authorization;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}
