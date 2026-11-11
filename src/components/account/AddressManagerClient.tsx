"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface AddressItem {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export function AddressManagerClient({
  initialAddresses,
}: {
  initialAddresses: AddressItem[];
}) {
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          line1,
          line2,
          city,
          state,
          pincode,
          isDefault,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to save address.");
        setSaving(false);
        return;
      }

      setAddresses((prev) =>
        isDefault
          ? [data.address, ...prev.map((a) => ({ ...a, isDefault: false }))]
          : [data.address, ...prev]
      );
      setFullName("");
      setPhone("");
      setLine1("");
      setLine2("");
      setCity("");
      setState("");
      setPincode("");
    } catch {
      setError("Network error while saving address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/account/addresses?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  }

  return (
    <div className="space-y-8">
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex flex-col justify-between border border-charcoal/15 bg-white p-5 text-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-charcoal">{addr.fullName}</p>
                  {addr.isDefault && (
                    <span className="bg-sand px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-2 text-charcoal/70">{addr.line1}</p>
                {addr.line2 && <p className="text-charcoal/70">{addr.line2}</p>}
                <p className="text-charcoal/70">
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
                <p className="mt-2 text-charcoal/60">{addr.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-charcoal/55 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="border border-charcoal/15 bg-white p-6 space-y-4"
      >
        <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-charcoal">
          Add New Delivery Address
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="border border-charcoal/25 bg-ivory/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none"
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile Number"
            className="border border-charcoal/25 bg-ivory/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none"
          />
        </div>

        <input
          required
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          placeholder="Address Line 1 (Flat, Building, Street)"
          className="w-full border border-charcoal/25 bg-ivory/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none"
        />

        <input
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
          placeholder="Landmark / Locality (Optional)"
          className="w-full border border-charcoal/25 bg-ivory/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="border border-charcoal/25 bg-ivory/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none"
          />
          <input
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="State"
            className="border border-charcoal/25 bg-ivory/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none"
          />
          <input
            required
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="PIN Code"
            className="border border-charcoal/25 bg-ivory/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-charcoal/75">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="accent-charcoal"
          />
          Set as default shipping address
        </label>

        {error && <p className="text-xs text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-charcoal px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase text-ivory disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Address"}
        </button>
      </form>
    </div>
  );
}

