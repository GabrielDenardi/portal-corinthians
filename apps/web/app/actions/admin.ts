"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME, requireAdminSession } from "@/lib/auth";
import { fetchApiJson } from "@/lib/api/base";
import { fetchAdminApi } from "@/lib/api/admin";

function splitTextarea(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function splitLines(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function loginAction(formData: FormData) {
  const email = `${formData.get("email") ?? ""}`.trim().toLowerCase();
  const password = `${formData.get("password") ?? ""}`;

  const response = await fetchApiJson<{ token: string; user: { role: string } }>("/admin/login", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({ email, password }),
    headers: {
      "content-type": "application/json",
    },
  });

  if (!response?.token) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, response.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

export async function approveIncomingStoryAction(formData: FormData) {
  await requireAdminSession(["admin", "editor"]);
  const id = `${formData.get("id") ?? ""}`;
  await fetchAdminApi(`/admin/inbox/${id}/approve`, { method: "POST" });
  revalidateTag("home-feed", "max");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin/materias");
}

export async function rejectIncomingStoryAction(formData: FormData) {
  await requireAdminSession(["admin", "editor"]);
  const id = `${formData.get("id") ?? ""}`;
  await fetchAdminApi(`/admin/inbox/${id}/reject`, { method: "POST" });
  revalidatePath("/admin/inbox");
}

export async function saveArticleAction(formData: FormData) {
  const session = await requireAdminSession(["admin", "editor"]);
  const id = `${formData.get("id") ?? ""}`;
  const categoryId = `${formData.get("categoryId") ?? ""}`;
  const action = `${formData.get("actionType") ?? "save"}` as
    | "save"
    | "approve"
    | "publish"
    | "unpublish"
    | "archive";

  await fetchAdminApi(`/admin/articles/${id}`, {
    method: "PATCH",
    body: {
      title: `${formData.get("title") ?? ""}`.trim(),
      dek: `${formData.get("dek") ?? ""}`.trim(),
      summary: `${formData.get("summary") ?? ""}`.trim(),
      body: splitTextarea(formData.get("body")),
      categoryId,
      featuredRank: Number(formData.get("featuredRank") ?? 0),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      isPinnedHome: formData.get("isPinnedHome") === "on",
      pinnedCategoryIds: formData.getAll("pinnedCategoryIds").map((value) => `${value}`),
      action,
    },
  });

  revalidateTag("home-feed", "max");
  revalidatePath("/");
  revalidatePath("/admin/materias");
  revalidatePath(`/admin/materias/${id}`);
  if (action === "publish" || (action === "save" && session.user.role === "admin")) {
    revalidatePath("/jogos");
  }
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdminSession(["admin"]);

  await fetchAdminApi("/admin/categories", {
    method: "POST",
    body: {
      id: `${formData.get("id") ?? ""}` || undefined,
      slug: `${formData.get("slug") ?? ""}`.trim(),
      label: `${formData.get("label") ?? ""}`.trim(),
      description: `${formData.get("description") ?? ""}`.trim(),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidateTag("home-feed", "max");
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function saveHomeSlotsAction(formData: FormData) {
  await requireAdminSession(["admin"]);

  const assignments = [
    "featured",
    "highlight-1",
    "highlight-2",
    "highlight-3",
    "spotlight-1",
    "spotlight-2",
    "spotlight-3",
  ].map((slot) => ({
    slot,
    articleId: `${formData.get(slot) ?? ""}` || null,
  }));

  await fetchAdminApi("/admin/home-slots", {
    method: "POST",
    body: { assignments },
  });

  revalidateTag("home-feed", "max");
  revalidatePath("/");
  revalidatePath("/admin/home");
}

export async function saveMatchAction(formData: FormData) {
  await requireAdminSession(["admin", "editor"]);

  const id = `${formData.get("id") ?? ""}`;
  const officials = splitLines(formData.get("officials")).map((line) => {
    const [role, name] = line.split(":", 2);
    return {
      role: role?.trim() || "Oficial",
      name: name?.trim() || role?.trim() || "",
    };
  });

  const lineups = splitLines(formData.get("lineups")).map((line) => {
    const [teamSide, section, playerName, shirtNumber, role] = line.split("|");
    return {
      teamSide: teamSide === "away" ? "away" : "home",
      section: section === "bench" ? "bench" : "starting",
      playerName: (playerName ?? "").trim(),
      shirtNumber: shirtNumber?.trim() || null,
      role: role?.trim() || null,
    };
  });

  const timeline = splitLines(formData.get("timeline")).map((line) => {
    const [minute, type, teamSide, title, description] = line.split("|");
    return {
      minute: (minute ?? "").trim(),
      type: (type ?? "").trim() || "context",
      teamSide: teamSide === "away" ? "away" : teamSide === "neutral" ? "neutral" : "home",
      title: (title ?? "").trim(),
      description: (description ?? "").trim(),
    };
  });

  await fetchAdminApi(`/admin/matches/${id}`, {
    method: "PATCH",
    body: {
      phase: `${formData.get("phase") ?? "pre"}`,
      scoreHome: `${formData.get("scoreHome") ?? ""}` ? Number(formData.get("scoreHome")) : null,
      scoreAway: `${formData.get("scoreAway") ?? ""}` ? Number(formData.get("scoreAway")) : null,
      stadium: `${formData.get("stadium") ?? ""}`.trim() || null,
      competitionStage: `${formData.get("competitionStage") ?? ""}`.trim() || null,
      officials,
      lineups: lineups.filter((item) => item.playerName),
      timeline: timeline.filter((item) => item.title),
      relatedArticleIds: formData.getAll("relatedArticleIds").map((value) => `${value}`),
    },
  });

  revalidateTag("matches", "max");
  revalidatePath("/jogos");
  revalidatePath(`/jogos/${id}`);
  revalidatePath("/admin/partidas");
  revalidatePath(`/admin/partidas/${id}`);
}

export async function saveUserAction(formData: FormData) {
  await requireAdminSession(["admin"]);

  await fetchAdminApi("/admin/users", {
    method: "POST",
    body: {
      email: `${formData.get("email") ?? ""}`.trim(),
      name: `${formData.get("name") ?? ""}`.trim(),
      role: `${formData.get("role") ?? "editor"}`,
      password: `${formData.get("password") ?? ""}`.trim() || undefined,
    },
  });

  revalidatePath("/admin/usuarios");
}
