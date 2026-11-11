"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { formatINR } from "@/lib/utils";
import type { DiscountType } from "@prisma/client";

export interface AdminCouponRow {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
}

export function AdminPromotionsClient({
  initialCoupons,
}: {
  initialCoupons: AdminCouponRow[];
}) {
  const [coupons, setCoupons] = useState<AdminCouponRow[]>(initialCoupons);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrderAmount, setMinOrderAmount] = useState("2999");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          description,
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrderAmount),
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create coupon");
        setSaving(false);
        return;
      }
      setCoupons((prev) => [data.coupon, ...prev]);
      setCode("");
      setDescription("");
      setExpiresAt("");
    } catch {
      setError("Network error creating coupon");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    if (res.ok) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !active } : c))
      );
    }
  }

  async function deleteCoupon(id: string) {
    const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="border border-charcoal/12 bg-white p-6 space-y-4 text-xs"
      >
        <h2 className="font-medium uppercase tracking-[0.18em] text-charcoal">
          Create Promotional Coupon
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Code (e.g. ARCHIVE15)"
            className="border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm uppercase"
          />
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            className="border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (₹)</option>
          </select>
          <input
            required
            type="number"
            min={1}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder="Discount value"
            className="border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
          />
          <input
            required
            type="number"
            min={0}
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            placeholder="Min Order (₹)"
            className="border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Internal / customer note"
            className="border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
          />
          <input
            type="number"
            min={1}
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="Max cap (₹, optional)"
            className="border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
          />
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
          />
        </div>

        {error && <p className="text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-ivory"
        >
          {saving ? "Creating..." : "Create Coupon"}
        </button>
      </form>

      <div className="overflow-x-auto border border-charcoal/12 bg-white">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-charcoal/12 bg-sand/30 text-[10px] uppercase tracking-[0.14em] text-charcoal/65">
              <th className="p-3.5">Code</th>
              <th className="p-3.5">Discount</th>
              <th className="p-3.5">Min Order</th>
              <th className="p-3.5">Used</th>
              <th className="p-3.5">Expiry</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="p-3.5 font-medium text-charcoal">{c.code}</td>
                <td className="p-3.5">
                  {c.discountType === "PERCENTAGE"
                    ? `${c.discountValue}%`
                    : formatINR(c.discountValue)}
                </td>
                <td className="p-3.5 tabular-nums">
                  {formatINR(c.minOrderAmount)}
                </td>
                <td className="p-3.5 tabular-nums">{c.usedCount}</td>
                <td className="p-3.5 text-charcoal/65">
                  {c.expiresAt
                    ? new Date(c.expiresAt).toLocaleDateString("en-IN")
                    : "No expiry"}
                </td>
                <td className="p-3.5">
                  <button
                    type="button"
                    onClick={() => toggleActive(c.id, c.active)}
                    className={`border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                      c.active
                        ? "border-olive text-olive"
                        : "border-charcoal/20 text-charcoal/50"
                    }`}
                  >
                    {c.active ? "Active" : "Paused"}
                  </button>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => deleteCoupon(c.id)}
                    aria-label={`Delete ${c.code}`}
                    className="p-1.5 text-charcoal/60 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

