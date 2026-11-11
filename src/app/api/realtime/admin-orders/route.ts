import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-guards";
import { isRealtimeConfigured, trySealAdminOrdersQuery } from "@/lib/realtime";

export async function POST() {
  try {
    await requireAdminSession();
  } catch (err) {
    const code = err instanceof Error && err.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: "Unauthorized" }, { status: code });
  }

  if (!isRealtimeConfigured()) {
    return NextResponse.json(
      { error: "Neon Realtime is not configured." },
      { status: 503 }
    );
  }

  const sealed = await trySealAdminOrdersQuery();
  if (!sealed) {
    return NextResponse.json(
      { error: "Unable to seal admin orders live query" },
      { status: 500 }
    );
  }

  return NextResponse.json(sealed, {
    headers: { "Cache-Control": "no-store" },
  });
}

