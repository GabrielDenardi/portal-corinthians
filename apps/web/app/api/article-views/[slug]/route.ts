import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/api/base";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const body = await request.json().catch(() => ({}));

  try {
    const response = await fetch(`${getApiBaseUrl()}/public/articles/${slug}/view`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ viewCount: 0, skipped: true }, { status: 202 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ viewCount: 0, skipped: true }, { status: 202 });
  }
}
