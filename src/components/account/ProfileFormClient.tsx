"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileFormClient({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to update profile.");
      } else {
        setMessage("Profile updated.");
        router.refresh();
      }
    } catch {
      setError("Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-charcoal/12 bg-white p-6 space-y-4 text-xs"
    >
      <h2 className="font-medium tracking-[0.18em] uppercase text-charcoal">
        Personal Profile
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
            Full Name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none"
          />
        </div>
        <div>
          <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98200 12345"
            className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none"
          />
        </div>
        <div>
          <label className="block uppercase tracking-[0.12em] text-charcoal/60 mb-1">
            Email (Account ID)
          </label>
          <input
            disabled
            value={email}
            className="w-full border border-charcoal/15 bg-sand/30 px-3 py-2.5 text-sm text-charcoal/60"
          />
        </div>
      </div>

      {error && <p className="text-red-700">{error}</p>}
      {message && <p className="text-olive font-medium">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-ivory disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}

