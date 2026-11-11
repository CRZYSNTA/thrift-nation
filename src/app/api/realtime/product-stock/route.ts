import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isRealtimeConfigured, trySealProductStockQuery } from "@/lib/realtime";

const schema = z.object({
  productId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  if (!isRealtimeConfigured()) {
    return NextResponse.json(
      { error: "Neon Realtime is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const sealed = await trySealProductStockQuery(parsed.data.productId);
    if (!sealed) {
      return NextResponse.json(
        { error: "Unable to seal live query" },
        { status: 500 }
      );
    }

    return NextResponse.json(sealed, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

