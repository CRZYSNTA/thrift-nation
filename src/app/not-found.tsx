import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-28 text-center">
      <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-olive">
        Archive 404
      </p>
      <h1 className="mt-3 font-editorial text-5xl text-charcoal">
        Piece Not Found
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
        The garment or archive page you are looking for may have moved or been
        retired from circulation.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="bg-charcoal px-7 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-ivory"
        >
          Return Home
        </Link>
        <Link
          href="/new-arrivals"
          className="border border-charcoal/25 px-7 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-charcoal hover:border-charcoal"
        >
          New Arrivals
        </Link>
      </div>
    </div>
  );
}

