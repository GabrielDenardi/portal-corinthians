import { Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { AuthController } from "./auth.controller";
import { AdminRateLimitGuard } from "./admin-rate-limit.guard";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { RolesGuard } from "./roles.guard";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RolesGuard, AdminRateLimitGuard, Reflector],
  exports: [AuthService, AuthGuard, RolesGuard, AdminRateLimitGuard],
})
export class AuthModule {}
