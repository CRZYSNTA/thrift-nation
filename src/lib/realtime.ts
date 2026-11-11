import {
  createRealtime,
  rawSql,
  type SealedLiveQuery,
} from "@neon/realtime/server";

export interface LiveProductStockRow {
  id: string;
  stockQuantity: number;
}

export interface LiveAdminOrderRow {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  customerName: string;
  createdAt: Date | string;
}

export function isRealtimeConfigured(): boolean {
  return Boolean(
    process.env.NEON_REALTIME_SECRET?.trim() &&
      (process.env.NEON_REALTIME_URL?.trim() ||
        process.env.NEXT_PUBLIC_NEON_REALTIME_URL?.trim())
  );
}

export function getNeonDatabaseName(): string {
  const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!dbUrl) return "neondb";
  try {
    const parsed = new URL(dbUrl);
    return parsed.pathname.replace(/^\//, "") || "neondb";
  } catch {
    return "neondb";
  }
}

export function getRealtimeServer() {
  const secret = process.env.NEON_REALTIME_SECRET;
  if (!secret) {
    throw new Error("NEON_REALTIME_SECRET is not configured.");
  }
  return createRealtime({
    secret,
    db: getNeonDatabaseName(),
  });
}

export function productStockQuery(productId: string) {
  return rawSql<LiveProductStockRow>(
    `SELECT id, "stockQuantity" FROM "Product" WHERE id = $1`,
    [productId]
  );
}

export function adminOrdersLiveQuery() {
  return rawSql<LiveAdminOrderRow>(
    `SELECT id, "orderNumber", status::text AS status, "paymentMethod"::text AS "paymentMethod", "paymentStatus"::text AS "paymentStatus", total, "customerName", "createdAt" FROM "Order" ORDER BY "createdAt" DESC LIMIT 10`
  );
}

export async function trySealProductStockQuery(
  productId: string
): Promise<SealedLiveQuery<LiveProductStockRow> | null> {
  if (!isRealtimeConfigured()) return null;
  try {
    const realtime = getRealtimeServer();
    return await realtime.seal({ query: productStockQuery(productId) });
  } catch (err) {
    console.warn("Unable to seal product stock live query:", err);
    return null;
  }
}

export async function trySealAdminOrdersQuery(): Promise<SealedLiveQuery<LiveAdminOrderRow> | null> {
  if (!isRealtimeConfigured()) return null;
  try {
    const realtime = getRealtimeServer();
    return await realtime.seal({ query: adminOrdersLiveQuery() });
  } catch (err) {
    console.warn("Unable to seal admin orders live query:", err);
    return null;
  }
}

