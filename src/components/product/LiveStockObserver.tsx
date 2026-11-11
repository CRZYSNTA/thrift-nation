"use client";

import { useCallback, useEffect, useState } from "react";
import type { SealedLiveQuery } from "@neon/realtime/client";
import { useLiveQuery } from "@neon/realtime-react";
import { useRealtimeEnabled } from "@/components/providers/RealtimeRoot";
import type { LiveProductStockRow } from "@/lib/realtime";

function LiveStockSubscriber({
  productId,
  initialStock,
  sealedQuery,
  onStockChange,
  onStatusChange,
}: {
  productId: string;
  initialStock: number;
  sealedQuery: SealedLiveQuery<LiveProductStockRow>;
  onStockChange: (stock: number) => void;
  onStatusChange?: (status: string) => void;
}) {
  const [query] = useState(sealedQuery);

  const refreshQuery = useCallback(async () => {
    const res = await fetch("/api/realtime/product-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (!res.ok) {
      throw new Error(`Could not renew live stock query (${res.status})`);
    }
    return (await res.json()) as SealedLiveQuery<LiveProductStockRow>;
  }, [productId]);

  const { data, status } = useLiveQuery(query, {
    refreshQuery,
    initialData: [{ id: productId, stockQuantity: initialStock }],
  });

  useEffect(() => {
    if (onStatusChange) onStatusChange(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    const liveRow = data?.[0];
    if (liveRow && typeof liveRow.stockQuantity === "number") {
      onStockChange(liveRow.stockQuantity);
    }
  }, [data, onStockChange]);

  return null;
}

export function LiveStockObserver({
  productId,
  initialStock,
  sealedQuery,
  onStockChange,
  onStatusChange,
}: {
  productId: string;
  initialStock: number;
  sealedQuery: SealedLiveQuery<LiveProductStockRow> | null;
  onStockChange: (stock: number) => void;
  onStatusChange?: (status: string) => void;
}) {
  const realtimeEnabled = useRealtimeEnabled();
  if (!realtimeEnabled || !sealedQuery) {
    return null;
  }

  return (
    <LiveStockSubscriber
      key={sealedQuery.queryFingerprint}
      productId={productId}
      initialStock={initialStock}
      sealedQuery={sealedQuery}
      onStockChange={onStockChange}
      onStatusChange={onStatusChange}
    />
  );
}

