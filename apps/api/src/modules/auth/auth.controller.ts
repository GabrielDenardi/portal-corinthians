import type { AdminLoginDTO } from "@portal-corinthians/contracts";
import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from "@nestjs/common";

import { CurrentSession } from "./current-session.decorator";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

@Controller("admin")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  login(
    @Body() body: AdminLoginDTO,
    @Req() request: { ip?: string; headers: Record<string, string | string[] | undefined> },
  ) {
    const forwarded = request.headers["x-forwarded-for"];
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded ?? request.ip ?? "unknown";
    return this.authService.login(body, ip);
  }

  @Get("session")
  @UseGuards(AuthGuard)
  getSession(@CurrentSession() session: Awaited<ReturnType<AuthService["getSessionFromToken"]>>) {
    return { user: session.user };
  }
}
