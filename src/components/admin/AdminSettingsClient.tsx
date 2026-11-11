"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettingsData } from "@/types/catalog";

export function AdminSettingsClient({
  settings,
}: {
  settings: SiteSettingsData;
}) {
  const router = useRouter();
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(settings.freeShippingThreshold)
  );
  const [standardShippingFee, setStandardShippingFee] = useState(
    String(settings.standardShippingFee)
  );
  const [codEnabled, setCodEnabled] = useState(settings.codEnabled);
  const [codFee, setCodFee] = useState(String(settings.codFee));
  const [razorpayEnabled, setRazorpayEnabled] = useState(
    settings.razorpayEnabled
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName,
        tagline,
        supportEmail,
        supportPhone,
        storeAddress,
        instagramUrl,
        whatsappNumber,
        freeShippingThreshold: Number(freeShippingThreshold),
        standardShippingFee: Number(standardShippingFee),
        codEnabled,
        codFee: Number(codFee),
        razorpayEnabled,
      }),
    });

    if (res.ok) {
      setMessage("Store settings updated successfully.");
      router.refresh();
    } else {
      setMessage("Failed to update store settings.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 text-xs">
      <div className="border border-charcoal/12 bg-white p-6 space-y-4">
        <h2 className="font-medium uppercase tracking-[0.18em] text-charcoal">
          Store Identity &amp; Contact
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
              Store Name
            </label>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
              Tagline
            </label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
              Support Phone
            </label>
            <input
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
            Atelier Address
          </label>
          <input
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="border border-charcoal/12 bg-white p-6 space-y-4">
        <h2 className="font-medium uppercase tracking-[0.18em] text-charcoal">
          Shipping &amp; Payment Configuration
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
              Free Shipping Above (₹)
            </label>
            <input
              type="number"
              min={0}
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
              Standard Shipping Fee (₹)
            </label>
            <input
              type="number"
              min={0}
              value={standardShippingFee}
              onChange={(e) => setStandardShippingFee(e.target.value)}
              className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
              COD Handling Fee (₹)
            </label>
            <input
              type="number"
              min={0}
              value={codFee}
              onChange={(e) => setCodFee(e.target.value)}
              className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-8 pt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={razorpayEnabled}
              onChange={(e) => setRazorpayEnabled(e.target.checked)}
              className="accent-charcoal"
            />
            Enable Razorpay Online Checkout
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="accent-charcoal"
            />
            Enable Cash on Delivery (COD)
          </label>
        </div>
      </div>

      <div className="border border-charcoal/12 bg-white p-6 space-y-4">
        <h2 className="font-medium uppercase tracking-[0.18em] text-charcoal">
          Social Channels
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
              Instagram URL
            </label>
            <input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
              WhatsApp Number (with country code)
            </label>
            <input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      {message && <p className="text-olive font-medium">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-charcoal px-8 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-ivory"
      >
        {saving ? "Saving..." : "Save Store Settings"}
      </button>
    </form>
  );
}

