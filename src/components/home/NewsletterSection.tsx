"use client";

import { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Unable to subscribe right now.");
        return;
      }
      setStatus("success");
      setMessage(data.message || "Welcome to the Nation. Early drop access awaits.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section className="border-t border-charcoal/12 bg-sand/35">
      <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-olive">
            Private Drop Dispatch
          </p>
          <h2 className="mt-3 font-editorial text-4xl sm:text-5xl text-charcoal">
            BE PART OF THE NATION.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
            Receive early access to weekly one-of-a-kind archive drops, editorial
            essays, and private studio previews in Mumbai.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-0"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 border border-charcoal/25 bg-white px-5 py-3.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-charcoal focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-charcoal px-8 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-ivory transition-colors hover:bg-charcoal/90 disabled:opacity-50"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-xs tracking-[0.04em] ${
                status === "error" ? "text-red-700" : "text-olive"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

