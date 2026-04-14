import type { HomeSlotAssignmentDTO } from "@portal-corinthians/contracts";
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";

import { CurrentSession } from "../auth/current-session.decorator";
import { AdminRateLimitGuard } from "../auth/admin-rate-limit.guard";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthenticatedSession } from "../auth/auth.types";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(AdminRateLimitGuard, AuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("inbox")
  @Roles("admin", "editor")
  listInbox() {
    return this.adminService.listInbox();
  }

  @Post("inbox/:id/approve")
  @Roles("admin", "editor")
  approveInboxItem(@Param("id") id: string, @CurrentSession() session: AuthenticatedSession) {
    return this.adminService.approveIncomingStory(id, session);
  }

  @Post("inbox/:id/reject")
  @Roles("admin", "editor")
  rejectInboxItem(@Param("id") id: string, @CurrentSession() session: AuthenticatedSession) {
    return this.adminService.rejectIncomingStory(id, session);
  }

  @Get("articles")
  @Roles("admin", "editor")
  listArticles() {
    return this.adminService.listArticles();
  }

  @Get("articles/:id")
  @Roles("admin", "editor")
  getArticle(@Param("id") id: string) {
    return this.adminService.getArticleEditor(id);
  }

  @Patch("articles/:id")
  @Roles("admin", "editor")
  updateArticle(
    @Param("id") id: string,
    @Body() body: Parameters<AdminService["updateArticle"]>[1],
    @CurrentSession() session: AuthenticatedSession,
  ) {
    return this.adminService.updateArticle(id, body, session);
  }

  @Get("categories")
  @Roles("admin", "editor")
  listCategories() {
    return this.adminService.listCategories();
  }

  @Post("categories")
  @Roles("admin")
  upsertCategory(
    @Body() body: Parameters<AdminService["upsertCategory"]>[0],
    @CurrentSession() session: AuthenticatedSession,
  ) {
    return this.adminService.upsertCategory(body, session);
  }

  @Get("home-slots")
  @Roles("admin", "editor")
  listHomeSlots() {
    return this.adminService.listHomeSlots();
  }

  @Post("home-slots")
  @Roles("admin")
  updateHomeSlots(
    @Body() body: { assignments: HomeSlotAssignmentDTO[] },
    @CurrentSession() session: AuthenticatedSession,
  ) {
    return this.adminService.updateHomeSlots(body.assignments, session);
  }

  @Get("matches")
  @Roles("admin", "editor")
  listMatches() {
    return this.adminService.listMatches();
  }

  @Get("matches/:id")
  @Roles("admin", "editor")
  getMatch(@Param("id") id: string) {
    return this.adminService.getMatch(id);
  }

  @Patch("matches/:id")
  @Roles("admin", "editor")
  updateMatch(
    @Param("id") id: string,
    @Body() body: Parameters<AdminService["updateMatch"]>[1],
    @CurrentSession() session: AuthenticatedSession,
  ) {
    return this.adminService.updateMatch(id, body, session);
  }

  @Get("users")
  @Roles("admin")
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post("users")
  @Roles("admin")
  upsertUser(
    @Body() body: Parameters<AdminService["upsertUser"]>[0],
    @CurrentSession() session: AuthenticatedSession,
  ) {
    return this.adminService.upsertUser(body, session);
  }

  @Get("audit")
  @Roles("admin", "editor")
  listAudit() {
    return this.adminService.listAuditLogs();
  }

  @Get("provider-health")
  @Roles("admin", "editor")
  getProviderHealth() {
    return this.adminService.getProviderHealth();
  }
}
