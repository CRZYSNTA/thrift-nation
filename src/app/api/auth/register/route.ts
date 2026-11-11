import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(80),
  email: z.string().email("Please provide a valid email address."),
  phone: z.string().min(8, "Please provide a valid mobile number.").max(20).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100),
});

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json(
        {
          error:
            "Database is not configured. Please set DATABASE_URL and run Prisma migrations.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid registration data." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        phone: parsed.data.phone?.trim() || null,
        passwordHash,
        role: "CUSTOMER",
        wishlist: { create: {} },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Unable to create account right now." },
      { status: 500 }
    );
  }
}

