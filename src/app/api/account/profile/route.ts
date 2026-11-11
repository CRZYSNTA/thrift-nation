import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(80),
  phone: z.string().max(20).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid profile details" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name.trim(),
      phone: parsed.data.phone?.trim() || null,
    },
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json({ user: updated });
}

