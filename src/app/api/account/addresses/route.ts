import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(4),
  line2: z.string().optional().nullable(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid 6-digit PIN code."),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured) {
    return NextResponse.json({ addresses: [] });
  }
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid address fields" },
      { status: 400 }
    );
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      fullName: parsed.data.fullName.trim(),
      phone: parsed.data.phone.trim(),
      line1: parsed.data.line1.trim(),
      line2: parsed.data.line2?.trim() || null,
      city: parsed.data.city.trim(),
      state: parsed.data.state.trim(),
      pincode: parsed.data.pincode.trim(),
      isDefault: Boolean(parsed.data.isDefault),
    },
  });

  return NextResponse.json({ address }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !isDatabaseConfigured) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.address.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ deleted: true });
}

