import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();

    if (!isDatabaseConfigured) {
      return NextResponse.json(
        {
          error:
            "Newsletter storage requires PostgreSQL DATABASE_URL configuration.",
        },
        { status: 503 }
      );
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email, active: true },
    });

    return NextResponse.json({
      message: "You are subscribed to THRIFT NATION private drops.",
    });
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    return NextResponse.json(
      { error: "Unable to process subscription right now." },
      { status: 500 }
    );
  }
}

