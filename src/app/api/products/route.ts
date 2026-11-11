import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(24, Math.max(1, Number(limitParam))) : 12;

  const products = await getProducts({ search, limit });
  return NextResponse.json({ products });
}

