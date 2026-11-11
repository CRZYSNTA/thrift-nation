"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CollectionSummary, EditorialArticle, SiteSettingsData } from "@/types/catalog";

export function AdminContentClient({
  settings,
  collections,
}: {
  settings: SiteSettingsData;
  collections: CollectionSummary[];
}) {
  const router = useRouter();
  const [announcementEnabled, setAnnouncementEnabled] = useState(
    settings.announcementEnabled
  );
  const [announcementText, setAnnouncementText] = useState(
    settings.announcementText
  );
  const [announcementLink, setAnnouncementLink] = useState(
    settings.announcementLink
  );
  const [heroHeadline, setHeroHeadline] = useState(settings.heroHeadline);
  const [heroSubheadline, setHeroSubheadline] = useState(
    settings.heroSubheadline
  );
  const [heroImage, setHeroImage] = useState(settings.heroImage);
  const [featuredCollectionIds, setFeaturedCollectionIds] = useState<string[]>(
    collections.filter((c) => c.featured).map((c) => c.id)
  );
  const [editorial, setEditorial] = useState<EditorialArticle[]>(
    settings.editorialContent
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function toggleCollection(id: string) {
    setFeaturedCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function updateEditorialField(
    idx: number,
    key: keyof EditorialArticle,
    value: string
  ) {
    setEditorial((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item))
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        announcementEnabled,
        announcementText,
        announcementLink,
        heroHeadline,
        heroSubheadline,
        heroImage,
        featuredCollectionIds,
        editorialContent: editorial,
      }),
    });

    if (res.ok) {
      setMessage("Editorial & banner content published.");
      router.refresh();
    } else {
      setMessage("Unable to update content.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 text-xs">
      {/* Announcement Bar */}
      <div className="border border-charcoal/12 bg-white p-6 space-y-4">
        <h2 className="font-medium uppercase tracking-[0.18em] text-charcoal">
          Promotional Announcement Bar
        </h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={announcementEnabled}
            onChange={(e) => setAnnouncementEnabled(e.target.checked)}
            className="accent-charcoal"
          />
          Show announcement bar across storefront
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Announcement message"
            className="border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
          />
          <input
            value={announcementLink}
            onChange={(e) => setAnnouncementLink(e.target.value)}
            placeholder="Link path (e.g. /new-arrivals)"
            className="border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="border border-charcoal/12 bg-white p-6 space-y-4">
        <h2 className="font-medium uppercase tracking-[0.18em] text-charcoal">
          Homepage Editorial Hero
        </h2>
        <input
          value={heroHeadline}
          onChange={(e) => setHeroHeadline(e.target.value)}
          placeholder="Hero Headline"
          className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
        />
        <textarea
          rows={2}
          value={heroSubheadline}
          onChange={(e) => setHeroSubheadline(e.target.value)}
          placeholder="Hero Subheadline"
          className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
        />
        <input
          value={heroImage}
          onChange={(e) => setHeroImage(e.target.value)}
          placeholder="Hero Image URL"
          className="w-full border border-charcoal/25 bg-ivory/30 px-3 py-2.5 text-sm"
        />
      </div>

      {/* Featured Collections */}
      <div className="border border-charcoal/12 bg-white p-6 space-y-4">
        <h2 className="font-medium uppercase tracking-[0.18em] text-charcoal">
          Featured Collections
        </h2>
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCollection(c.id)}
              className={`border px-3 py-2 text-[11px] uppercase tracking-[0.14em] ${
                featuredCollectionIds.includes(c.id)
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-charcoal/20 bg-white text-charcoal"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editorial Journal */}
      <div className="border border-charcoal/12 bg-white p-6 space-y-6">
        <h2 className="font-medium uppercase tracking-[0.18em] text-charcoal">
          Editorial Journal Content
        </h2>
        {editorial.map((art, i) => (
          <div
            key={art.id}
            className="grid grid-cols-1 gap-3 border border-charcoal/10 p-4 sm:grid-cols-2"
          >
            <input
              value={art.issue}
              onChange={(e) => updateEditorialField(i, "issue", e.target.value)}
              placeholder="Issue label"
              className="border border-charcoal/25 px-3 py-2 text-xs"
            />
            <input
              value={art.title}
              onChange={(e) => updateEditorialField(i, "title", e.target.value)}
              placeholder="Article title"
              className="border border-charcoal/25 px-3 py-2 text-xs"
            />
            <textarea
              rows={2}
              value={art.excerpt}
              onChange={(e) =>
                updateEditorialField(i, "excerpt", e.target.value)
              }
              placeholder="Excerpt"
              className="border border-charcoal/25 px-3 py-2 text-xs sm:col-span-2"
            />
            <input
              value={art.image}
              onChange={(e) => updateEditorialField(i, "image", e.target.value)}
              placeholder="Image URL"
              className="border border-charcoal/25 px-3 py-2 text-xs"
            />
            <input
              value={art.href}
              onChange={(e) => updateEditorialField(i, "href", e.target.value)}
              placeholder="Destination link"
              className="border border-charcoal/25 px-3 py-2 text-xs"
            />
          </div>
        ))}
      </div>

      {message && <p className="text-olive font-medium">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-charcoal px-8 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-ivory"
      >
        {saving ? "Publishing..." : "Publish Content Updates"}
      </button>
    </form>
  );
}

