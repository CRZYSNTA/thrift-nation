import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const cartValidateSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = cartValidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({ valid: true, issues: [] });
    }

    const ids = parsed.data.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        price: true,
        stockQuantity: true,
        published: true,
      },
    });

    const byId = new Map(dbProducts.map((p) => [p.id, p]));
    const issues: Array<{ productId: string; message: string; available: number }> = [];

    for (const item of parsed.data.items) {
      const p = byId.get(item.productId);
      if (!p || !p.published || p.stockQuantity <= 0) {
        issues.push({
          productId: item.productId,
          message: `${p?.name ?? "Item"} is no longer available.`,
          available: 0,
        });
      } else if (item.quantity > p.stockQuantity) {
        issues.push({
          productId: item.productId,
          message: `Only ${p.stockQuantity} unit(s) of ${p.name} remain.`,
          available: p.stockQuantity,
        });
      }
    }

    return NextResponse.json({
      valid: issues.length === 0,
      issues,
    });
  } catch {
    return NextResponse.json({ valid: true, issues: [] });
  }
}

