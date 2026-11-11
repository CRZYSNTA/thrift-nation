"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface AnnouncementBarProps {
  enabled: boolean;
  text: string;
  link: string;
}

export function AnnouncementBar({ enabled, text, link }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || dismissed || !text) return null;

  return (
    <div className="relative bg-charcoal text-ivory border-b border-ivory/10">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center px-10 py-2.5 text-center">
        <Link
          href={link || "/new-arrivals"}
          className="text-[11px] font-medium tracking-[0.18em] uppercase text-ivory/90 hover:text-white transition-colors"
        >
          {text}
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-ivory/70 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

