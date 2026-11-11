"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit2, Plus, Trash2, Upload, X } from "lucide-react";
import { CONDITION_LABELS, formatINR } from "@/lib/utils";
import type { CategorySummary, CollectionSummary } from "@/types/catalog";
import type { ConditionGrade, Gender } from "@prisma/client";

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  collectionIds: string[];
  gender: Gender;
  price: number;
  originalPrice: number | null;
  originalPriceVerified: boolean;
  size: string;
  measurements: Record<string, string>;
  condition: ConditionGrade;
  conditionNotes: string | null;
  material: string;
  era: string | null;
  color: string | null;
  stockQuantity: number;
  sku: string;
  featured: boolean;
  published: boolean;
  description: string;
  imageUrls: string[];
}

export function AdminProductsClient({
  initialProducts,
  categories,
  collections,
}: {
  initialProducts: AdminProductRow[];
  categories: CategorySummary[];
  collections: CollectionSummary[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProductRow[]>(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [gender, setGender] = useState<Gender>("UNISEX");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [originalPriceVerified, setOriginalPriceVerified] = useState(false);
  const [size, setSize] = useState("M");
  const [condition, setCondition] = useState<ConditionGrade>("EXCELLENT");
  const [conditionNotes, setConditionNotes] = useState("");
  const [material, setMaterial] = useState("");
  const [era, setEra] = useState("");
  const [color, setColor] = useState("");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [sku, setSku] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [description, setDescription] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("/images/prod-trench.jpg");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [sleeve, setSleeve] = useState("");
  const [length, setLength] = useState("");

  function openCreate() {
    setEditingId(null);
    setName("");
    setBrand("");
    setCategoryId(categories[0]?.id ?? "");
    setCollectionIds([]);
    setGender("UNISEX");
    setPrice("");
    setOriginalPrice("");
    setOriginalPriceVerified(false);
    setSize("M");
    setCondition("EXCELLENT");
    setConditionNotes("");
    setMaterial("");
    setEra("");
    setColor("");
    setStockQuantity("1");
    setSku(`TN-ARC-${Math.floor(100 + Math.random() * 900)}`);
    setFeatured(false);
    setPublished(true);
    setDescription("");
    setImageUrlsText("/images/prod-trench.jpg");
    setChest("");
    setWaist("");
    setShoulder("");
    setSleeve("");
    setLength("");
    setError("");
    setModalOpen(true);
  }

  function openEdit(p: AdminProductRow) {
    setEditingId(p.id);
    setName(p.name);
    setBrand(p.brand);
    setCategoryId(p.categoryId);
    setCollectionIds(p.collectionIds);
    setGender(p.gender);
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
    setOriginalPriceVerified(p.originalPriceVerified);
    setSize(p.size);
    setCondition(p.condition);
    setConditionNotes(p.conditionNotes ?? "");
    setMaterial(p.material);
    setEra(p.era ?? "");
    setColor(p.color ?? "");
    setStockQuantity(String(p.stockQuantity));
    setSku(p.sku);
    setFeatured(p.featured);
    setPublished(p.published);
    setDescription(p.description);
    setImageUrlsText(p.imageUrls.join("\n"));
    setChest(p.measurements.chest ?? "");
    setWaist(p.measurements.waist ?? "");
    setShoulder(p.measurements.shoulder ?? "");
    setSleeve(p.measurements.sleeve ?? "");
    setLength(p.measurements.length ?? "");
    setError("");
    setModalOpen(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else if (data.url) {
        setImageUrlsText((prev) =>
          prev.trim() ? `${prev.trim()}\n${data.url}` : data.url
        );
      }
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const imageUrls = imageUrlsText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const measurements: Record<string, string> = {};
    if (chest.trim()) measurements.chest = chest.trim();
    if (waist.trim()) measurements.waist = waist.trim();
    if (shoulder.trim()) measurements.shoulder = shoulder.trim();
    if (sleeve.trim()) measurements.sleeve = sleeve.trim();
    if (length.trim()) measurements.length = length.trim();

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name,
      brand,
      categoryId,
      collectionIds,
      gender,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      originalPriceVerified,
      size,
      measurements,
      condition,
      conditionNotes,
      material,
      era,
      color,
      stockQuantity: Number(stockQuantity),
      sku,
      featured,
      published,
      description,
      imageUrls,
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        setSaving(false);
        return;
      }

      setModalOpen(false);
      router.refresh();
      window.location.reload();
    } catch {
      setError("Network error while saving product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete or archive this piece?")) return;
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
  }

  function toggleCollection(id: string) {
    setCollectionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-[0.12em] uppercase text-charcoal/65">
          {products.length} Total Archive Listings
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-charcoal px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-ivory"
        >
          <Plus className="h-3.5 w-3.5" /> Add Archive Piece
        </button>
      </div>

      <div className="overflow-x-auto border border-charcoal/12 bg-white">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-charcoal/12 bg-sand/30 text-[10px] tracking-[0.14em] uppercase text-charcoal/65">
              <th className="p-3.5">Piece</th>
              <th className="p-3.5">SKU</th>
              <th className="p-3.5">Condition</th>
              <th className="p-3.5">Price</th>
              <th className="p-3.5">Stock</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-9 shrink-0 border border-charcoal/10 bg-sand/30">
                      <Image
                        src={p.imageUrls[0] || "/images/prod-trench.jpg"}
                        alt={p.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{p.name}</p>
                      <p className="text-[11px] text-charcoal/55">
                        {p.brand} · {p.categoryName} · Size {p.size}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3.5 tabular-nums text-charcoal/70">{p.sku}</td>
                <td className="p-3.5">{CONDITION_LABELS[p.condition]}</td>
                <td className="p-3.5 font-medium tabular-nums">
                  {formatINR(p.price)}
                </td>
                <td className="p-3.5 tabular-nums">
                  <span
                    className={
                      p.stockQuantity <= 0 ? "text-red-700 font-medium" : "text-olive"
                    }
                  >
                    {p.stockQuantity}
                  </span>
                </td>
                <td className="p-3.5">
                  <span className="border border-charcoal/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">
                    {p.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      aria-label={`Edit ${p.name}`}
                      className="p-1.5 text-charcoal/70 hover:text-charcoal"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      aria-label={`Delete ${p.name}`}
                      className="p-1.5 text-charcoal/60 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-charcoal/20 bg-ivory p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-charcoal/12 pb-4">
              <h2 className="font-editorial text-3xl text-charcoal">
                {editingId ? "Edit Archive Piece" : "New Archive Piece"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Title *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Brand / House *
                  </label>
                  <input
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Original Retail (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Stock Qty *
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    SKU *
                  </label>
                  <input
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="UNISEX">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Condition *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) =>
                      setCondition(e.target.value as ConditionGrade)
                    }
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="LIKE_NEW">Like New</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Size *
                  </label>
                  <input
                    required
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Material *
                  </label>
                  <input
                    required
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Era
                  </label>
                  <input
                    value={era}
                    onChange={(e) => setEra(e.target.value)}
                    placeholder="e.g. 1990s"
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                    Color
                  </label>
                  <input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Measurements */}
              <div>
                <p className="uppercase tracking-[0.14em] text-charcoal/65 mb-2">
                  Garment Measurements
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <input
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    placeholder="Chest (e.g. 42 in)"
                    className="border border-charcoal/25 bg-white px-2.5 py-2 text-xs"
                  />
                  <input
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    placeholder="Waist"
                    className="border border-charcoal/25 bg-white px-2.5 py-2 text-xs"
                  />
                  <input
                    value={shoulder}
                    onChange={(e) => setShoulder(e.target.value)}
                    placeholder="Shoulder"
                    className="border border-charcoal/25 bg-white px-2.5 py-2 text-xs"
                  />
                  <input
                    value={sleeve}
                    onChange={(e) => setSleeve(e.target.value)}
                    placeholder="Sleeve"
                    className="border border-charcoal/25 bg-white px-2.5 py-2 text-xs"
                  />
                  <input
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="Length"
                    className="border border-charcoal/25 bg-white px-2.5 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Collections */}
              <div>
                <p className="uppercase tracking-[0.14em] text-charcoal/65 mb-2">
                  Collections
                </p>
                <div className="flex flex-wrap gap-2">
                  {collections.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCollection(c.id)}
                      className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] ${
                        collectionIds.includes(c.id)
                          ? "border-charcoal bg-charcoal text-ivory"
                          : "border-charcoal/20 bg-white text-charcoal"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="uppercase tracking-[0.14em] text-charcoal/65">
                    Image URLs (one per line) *
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-olive hover:underline">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "Uploading..." : "Upload via Cloudinary"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  required
                  rows={3}
                  value={imageUrlsText}
                  onChange={(e) => setImageUrlsText(e.target.value)}
                  className="w-full border border-charcoal/25 bg-white px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                  Condition Notes
                </label>
                <input
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-[0.14em] text-charcoal/65 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-charcoal/25 bg-white px-3 py-2.5 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={originalPriceVerified}
                    onChange={(e) => setOriginalPriceVerified(e.target.checked)}
                    className="accent-charcoal"
                  />
                  Original Price Verified
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="accent-charcoal"
                  />
                  Featured Piece
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="accent-charcoal"
                  />
                  Published
                </label>
              </div>

              {error && (
                <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-charcoal/25 px-6 py-3 uppercase tracking-[0.14em]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-charcoal px-7 py-3 uppercase tracking-[0.16em] text-ivory disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

