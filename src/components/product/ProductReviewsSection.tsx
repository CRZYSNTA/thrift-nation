"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  verified: boolean;
  authorName: string;
  createdAt: string;
}

export function ProductReviewsSection({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: ReviewItem[];
}) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to submit review.");
        setSubmitting(false);
        return;
      }
      setReviews((prev) => [data.review, ...prev]);
      setTitle("");
      setComment("");
      setRating(5);
    } catch {
      setError("Network error submitting review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-charcoal/12 bg-ivory">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-5">
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
                Client Impressions
              </p>
              <h2 className="mt-2 font-editorial text-3xl text-charcoal">
                Archive Reviews ({reviews.length})
              </h2>
            </div>

            {session?.user ? (
              <form
                onSubmit={handleSubmit}
                className="border border-charcoal/12 bg-white p-6 space-y-4 text-xs"
              >
                <p className="font-medium uppercase tracking-[0.14em] text-charcoal">
                  Share Your Note
                </p>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} stars`}
                      className="p-0.5 text-charcoal"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          star <= rating
                            ? "fill-charcoal text-charcoal"
                            : "text-charcoal/25"
                        )}
                      />
                    </button>
                  ))}
                </div>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Headline (optional)"
                  className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none"
                />
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comment on fabric weight, drape, and condition accuracy..."
                  className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none"
                />

                {error && <p className="text-red-700">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-ivory disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Review"}
                </button>
              </form>
            ) : (
              <div className="border border-charcoal/12 bg-white p-6 text-xs text-charcoal/70">
                <Link
                  href="/login"
                  className="font-medium text-charcoal underline underline-offset-4"
                >
                  Sign in
                </Link>{" "}
                to leave a note on fabric quality and sizing.
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            {reviews.length === 0 ? (
              <div className="border border-charcoal/12 bg-white p-8 text-sm text-charcoal/65">
                No reviews yet for this singular piece.
              </div>
            ) : (
              <div className="divide-y divide-charcoal/12 border border-charcoal/12 bg-white">
                {reviews.map((r) => (
                  <div key={r.id} className="p-6 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-charcoal">
                          {r.authorName}
                        </span>
                        {r.verified && (
                          <span className="bg-sand px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-charcoal">
                            Verified Collector
                          </span>
                        )}
                      </div>
                      <span className="text-charcoal/50">
                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "h-3.5 w-3.5",
                            s <= r.rating
                              ? "fill-charcoal text-charcoal"
                              : "text-charcoal/20"
                          )}
                        />
                      ))}
                    </div>
                    {r.title && (
                      <p className="text-sm font-medium text-charcoal">
                        {r.title}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed text-charcoal/75">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

