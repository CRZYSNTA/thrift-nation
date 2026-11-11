"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password. Please verify your credentials.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <div className="border border-charcoal/15 bg-white p-8 sm:p-10">
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
          Member Access
        </p>
        <h1 className="mt-2 font-editorial text-4xl text-charcoal">Sign In</h1>
        <p className="mt-2 text-xs leading-relaxed text-charcoal/65">
          Access your saved archive pieces, order tracking, and delivery
          addresses.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              Password
            </label>
            <input
              type="password"
              required
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 border-t border-charcoal/10 pt-6 text-center text-xs text-charcoal/70">
          New to THRIFT NATION?{" "}
          <Link
            href="/register"
            className="font-medium text-charcoal underline underline-offset-4"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-24">
          <div className="h-96 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

