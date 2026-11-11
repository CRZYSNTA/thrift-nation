"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to register.");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error while creating your account.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <div className="border border-charcoal/15 bg-white p-8 sm:p-10">
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
          Join the Archive
        </p>
        <h1 className="mt-2 font-editorial text-4xl text-charcoal">
          Create Account
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-charcoal/65">
          Save one-of-a-kind finds, manage shipping addresses, and follow your
          deliveries.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
              Full Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ananya Rao"
              className="w-full border border-charcoal/25 bg-ivory/30 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-charcoal/25 bg-ivory/30 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
              Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9820012345"
              className="w-full border border-charcoal/25 bg-ivory/30 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
              Password (min. 8 characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-charcoal/25 bg-ivory/30 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
            />
          </div>

          {error && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-ivory hover:bg-charcoal/90 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 border-t border-charcoal/10 pt-6 text-center text-xs text-charcoal/70">
          Already a member?{" "}
          <Link
            href="/login"
            className="font-medium text-charcoal underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

