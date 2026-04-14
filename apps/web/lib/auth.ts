import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { SessionDTO, UserRole } from "@portal-corinthians/contracts";

import { fetchApiJson } from "@/lib/api/base";

export const SESSION_COOKIE_NAME = "portal_admin_session";

export async function getAdminToken() {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getAdminSession(): Promise<SessionDTO | null> {
  const token = await getAdminToken();

  if (!token) {
    return null;
  }

  return fetchApiJson<SessionDTO>("/admin/session", {
    cache: "no-store",
    headers: {
      "x-admin-session": token,
    },
  });
}

export async function requireAdminSession(roles?: UserRole[]) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  if (roles && !roles.includes(session.user.role)) {
    redirect("/admin");
  }

  return session;
}
