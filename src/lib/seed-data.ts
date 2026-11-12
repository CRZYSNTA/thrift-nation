import { ConditionGrade, Gender } from "@prisma/client";
import type {
  CategorySummary,
  CollectionSummary,
  EditorialArticle,
  GarmentMeasurements,
  ProductDetailItem,
  SiteSettingsData,
} from "@/types/catalog";

export const DEFAULT_EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    id: "ed-1",
    issue: "JOURNAL 04",
    title: "The Quiet Architecture of 1990s Tailoring",
    excerpt:
      "Why unhurried wool, natural shoulder construction, and generous drape outlive every seasonal trend cycle.",
    image: "/images/editorial-1.jpg",
    href: "/collections/vintage-essentials",
    readTime: "4 MIN READ",
  },
  {
    id: "ed-2",
    issue: "JOURNAL 03",
    title: "Patina, Provenance & Lambskin",
    excerpt:
      "Inside our restoration process: how decades-old leather and Japanese selvedge earn character that cannot be manufactured new.",
    image: "/images/editorial-2.jpg",
    href: "/collections/statement-pieces",
    readTime: "5 MIN READ",
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  storeName: "THRIFT NATION",
  tagline: "Pre-loved. Reimagined. Yours.",
  supportEmail: "concierge@thriftnation.in",
  supportPhone: "+91 98200 12345",
  whatsappNumber: "919820012345",
  instagramUrl: "https://instagram.com/thriftnation.in",
  storeAddress: "14 Kala Ghoda, Fort, Mumbai 400001",
  freeShippingThreshold: 2999,
  standardShippingFee: 199,
  codEnabled: true,
  codFee: 99,
  razorpayEnabled: true,
  announcementEnabled: true,
  announcementText:
    "COMPLIMENTARY EXPRESS SHIPPING ABOVE ₹2,999 — ARCHIVE DROP 04 NOW LIVE",
  announcementLink: "/new-arrivals",
  heroHeadline: "FASHION FINDS A SECOND LIFE.",
  heroSubheadline:
    "Discover carefully curated pieces. Unique styles, timeless finds and fashion worth wearing again.",
  heroImage: "/images/hero-editorial.jpg",
  editorialContent: DEFAULT_EDITORIAL_ARTICLES,
};

export const SEED_CATEGORIES: CategorySummary[] = [
  { id: "cat-shirts", name: "Shirts", slug: "shirts", gender: "MEN" },
  { id: "cat-tshirts", name: "T-shirts", slug: "t-shirts", gender: "MEN" },
  { id: "cat-tops", name: "Tops", slug: "tops", gender: "WOMEN" },
  { id: "cat-dresses", name: "Dresses", slug: "dresses", gender: "WOMEN" },
  { id: "cat-skirts", name: "Skirts", slug: "skirts", gender: "WOMEN" },
  { id: "cat-trousers", name: "Trousers", slug: "trousers", gender: null },
  { id: "cat-denim", name: "Denim", slug: "denim", gender: null },
  { id: "cat-outerwear", name: "Outerwear", slug: "outerwear", gender: null },
  { id: "cat-jackets", name: "Jackets", slug: "jackets", gender: "MEN" },
];

export const SEED_COLLECTIONS: CollectionSummary[] = [
  {
    id: "col-vintage-essentials",
    name: "Vintage Essentials",
    slug: "vintage-essentials",
    subtitle: "FOUNDATIONAL SILHOUETTES",
    description:
      "Timeless trench coats, double-breasted tailoring, and enduring natural fibers sourced from European and Japanese archives.",
    image: "/images/prod-trench.jpg",
    featured: true,
  },
  {
    id: "col-streetwear",
    name: "Streetwear",
    slug: "streetwear",
    subtitle: "CULTURAL ARCHIVES",
    description:
      "Heavyweight varsity wool, patinated leather bombers, and utilitarian silhouettes with authentic 80s and 90s provenance.",
    image: "/images/prod-varsity.jpg",
    featured: true,
  },
  {
    id: "col-everyday-classics",
    name: "Everyday Classics",
    slug: "everyday-classics",
    subtitle: "REFINED UTILITY",
    description:
      "Effortless daily pieces engineered from breathable wool, crisp gabardine, and softly broken-in herringbone cotton.",
    image: "/images/prod-blazer-olive.jpg",
    featured: true,
  },
  {
    id: "col-statement-pieces",
    name: "Statement Pieces",
    slug: "statement-pieces",
    subtitle: "ONE-OF-ONE COLLECTIBLES",
    description:
      "Distinctive hero garments selected for sculptural drape, rare fabrications, and unmistakable presence.",
    image: "/images/prod-leather-bomber.jpg",
    featured: true,
  },
  {
    id: "col-denim-collection",
    name: "Denim Collection",
    slug: "denim-collection",
    subtitle: "SELVEDGE & INDIGO",
    description:
      "Naturally faded Japanese and American workwear denim carrying years of organic indigo character.",
    image: "/images/prod-denim-jacket.jpg",
    featured: true,
  },
];

export interface SeedProductInput {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categorySlug: string;
  collectionSlugs: string[];
  gender: Gender;
  price: number;
  originalPrice: number | null;
  originalPriceVerified: boolean;
  size: string;
  measurements: GarmentMeasurements;
  condition: ConditionGrade;
  conditionNotes: string;
  material: string;
  era: string;
  color: string;
  stockQuantity: number;
  sku: string;
  featured: boolean;
  description: string;
  images: Array<{ url: string; alt: string }>;
}

export const SEED_PRODUCTS: SeedProductInput[] = [
  {
    id: "prod-1",
    name: "1990s Double-Breasted Gabardine Trench Coat",
    slug: "1990s-double-breasted-gabardine-trench-coat",
    brand: "Aquascutum Archive",
    categorySlug: "outerwear",
    collectionSlugs: ["vintage-essentials", "everyday-classics"],
    gender: "UNISEX",
    price: 8999,
    originalPrice: 48000,
    originalPriceVerified: true,
    size: "M / Relaxed",
    measurements: {
      chest: "44 in (112 cm)",
      shoulder: "19 in (48 cm)",
      sleeve: "25 in (63.5 cm)",
      length: "45.5 in (115.5 cm)",
      notes: "Raglan shoulder allows effortless layering over knitwear or blazers.",
    },
    condition: "EXCELLENT",
    conditionNotes:
      "Professionally dry-cleaned and water-repellent treated. Original horn buttons intact.",
    material: "100% Cotton Gabardine, Check Cotton Lining",
    era: "Late 1990s",
    color: "Warm Stone",
    stockQuantity: 1,
    sku: "TN-ARC-001",
    featured: true,
    description:
      "Sourced from London, this late-1990s stone cotton gabardine trench features storm flaps, buckled cuffs, and an architectural A-line drape. A singular archive piece built to outlast decades.",
    images: [
      { url: "/images/prod-trench.jpg", alt: "1990s Double-Breasted Gabardine Trench Coat front view" },
      { url: "/images/hero-editorial.jpg", alt: "1990s Trench Coat editorial styling" },
    ],
  },
  {
    id: "prod-2",
    name: "Tailored Muted Olive Virgin Wool Blazer",
    slug: "tailored-muted-olive-virgin-wool-blazer",
    brand: "Cerruti 1881 Vintage",
    categorySlug: "outerwear",
    collectionSlugs: ["vintage-essentials", "everyday-classics"],
    gender: "WOMEN",
    price: 6499,
    originalPrice: 32000,
    originalPriceVerified: true,
    size: "S / M",
    measurements: {
      chest: "39 in (99 cm)",
      shoulder: "17 in (43 cm)",
      sleeve: "23.5 in (60 cm)",
      length: "29 in (73.5 cm)",
      notes: "Slightly oversized box silhouette; fits UK 8–12 depending on desired drape.",
    },
    condition: "LIKE_NEW",
    conditionNotes:
      "Crisp lapels, spotless cupro lining, zero pilling or structural fatigue.",
    material: "100% Italian Virgin Wool, Cupro Lining",
    era: "1990s",
    color: "Muted Olive",
    stockQuantity: 1,
    sku: "TN-ARC-002",
    featured: true,
    description:
      "Crafted in Italy from fine matte virgin wool in our signature muted olive tone. Features soft padded shoulders, twin welt pockets, and horn buttons.",
    images: [
      { url: "/images/prod-blazer-olive.jpg", alt: "Tailored Muted Olive Virgin Wool Blazer front" },
      { url: "/images/cat-women.jpg", alt: "Muted Olive Blazer editorial look" },
    ],
  },
  {
    id: "prod-3",
    name: "Washed Japanese Selvedge Type-III Denim Jacket",
    slug: "washed-japanese-selvedge-type-iii-denim-jacket",
    brand: "Edwin Archive Japan",
    categorySlug: "denim",
    collectionSlugs: ["denim-collection", "streetwear"],
    gender: "MEN",
    price: 5499,
    originalPrice: 18500,
    originalPriceVerified: true,
    size: "L",
    measurements: {
      chest: "43 in (109 cm)",
      shoulder: "18.5 in (47 cm)",
      sleeve: "25 in (63.5 cm)",
      length: "25.5 in (65 cm)",
      notes: "Classic boxy vintage trucker cut.",
    },
    condition: "EXCELLENT",
    conditionNotes:
      "Natural honeycombing and authentic indigo fade along seams; zero tears.",
    material: "14oz Japanese Red-Line Selvedge Cotton Denim",
    era: "Early 2000s",
    color: "Washed Indigo",
    stockQuantity: 1,
    sku: "TN-ARC-003",
    featured: true,
    description:
      "Woven on vintage shuttle looms in Kojima, this Type-III denim jacket carries honest, unforced indigo fading that only years of wear can produce.",
    images: [
      { url: "/images/prod-denim-jacket.jpg", alt: "Washed Japanese Selvedge Denim Jacket" },
      { url: "/images/story-archive.jpg", alt: "Curated denim archive rack" },
    ],
  },
  {
    id: "prod-4",
    name: "Patinated Espresso Lambskin Bomber Jacket",
    slug: "patinated-espresso-lambskin-bomber-jacket",
    brand: "Schott NYC Archive",
    categorySlug: "jackets",
    collectionSlugs: ["statement-pieces", "streetwear"],
    gender: "MEN",
    price: 11999,
    originalPrice: 54000,
    originalPriceVerified: true,
    size: "M",
    measurements: {
      chest: "44 in (112 cm)",
      shoulder: "19 in (48 cm)",
      sleeve: "25 in (63.5 cm)",
      length: "26 in (66 cm)",
      notes: "Dropped shoulder bomber fit with ribbed wool-blend hem.",
    },
    condition: "GOOD",
    conditionNotes:
      "Supple patinated leather with subtle natural creasing along elbows; conditioned and lined clean.",
    material: "100% Full-Grain Lambskin Leather, Viscose Lining",
    era: "1980s",
    color: "Espresso Brown",
    stockQuantity: 1,
    sku: "TN-ARC-004",
    featured: true,
    description:
      "An extraordinary 1980s flight-inspired lambskin bomber in deep espresso. Softened over three decades, featuring brass hardware and storm-welt pockets.",
    images: [
      { url: "/images/prod-leather-bomber.jpg", alt: "Patinated Espresso Lambskin Bomber Jacket" },
      { url: "/images/editorial-2.jpg", alt: "Espresso Leather Bomber editorial portrait" },
    ],
  },
  {
    id: "prod-5",
    name: "Japanese Herringbone Pleated Wide Trousers",
    slug: "japanese-herringbone-pleated-wide-trousers",
    brand: "Margaret Howell Vintage",
    categorySlug: "trousers",
    collectionSlugs: ["everyday-classics", "vintage-essentials"],
    gender: "UNISEX",
    price: 4299,
    originalPrice: 21000,
    originalPriceVerified: true,
    size: "30 / M",
    measurements: {
      waist: "30.5 in (77.5 cm)",
      hip: "42 in (106.5 cm)",
      inseam: "30 in (76 cm)",
      length: "41.5 in (105.5 cm)",
      notes: "High-rise double-pleat silhouette with side waist tabs.",
    },
    condition: "LIKE_NEW",
    conditionNotes: "Zero fraying at cuffs; crisp double front pleats.",
    material: "100% Brushed Cotton Herringbone Twill",
    era: "2000s",
    color: "Field Olive",
    stockQuantity: 1,
    sku: "TN-ARC-005",
    featured: true,
    description:
      "Architectural wide-leg trousers cut from dense Japanese herringbone twill in muted field olive. Designed with deep double pleats and corozo nut buttons.",
    images: [
      { url: "/images/prod-cargo-trousers.jpg", alt: "Japanese Herringbone Pleated Wide Trousers" },
      { url: "/images/cat-men.jpg", alt: "Tailored trouser editorial look" },
    ],
  },
  {
    id: "prod-6",
    name: "Charcoal Virgin Wool Pleated Midi Skirt",
    slug: "charcoal-virgin-wool-pleated-midi-skirt",
    brand: "Jil Sander Archive",
    categorySlug: "skirts",
    collectionSlugs: ["vintage-essentials", "statement-pieces"],
    gender: "WOMEN",
    price: 4999,
    originalPrice: 28000,
    originalPriceVerified: true,
    size: "S / 28",
    measurements: {
      waist: "27.5 in (70 cm)",
      hip: "39 in (99 cm)",
      length: "31 in (78.5 cm)",
      notes: "Concealed side zip closure; sits cleanly at the natural waist.",
    },
    condition: "EXCELLENT",
    conditionNotes: "Knife pleats remain razor-sharp; silk-blend lining intact.",
    material: "100% Virgin Wool, Silk-Blend Lining",
    era: "Late 1990s",
    color: "Deep Charcoal",
    stockQuantity: 1,
    sku: "TN-ARC-006",
    featured: true,
    description:
      "Minimalist precision from the late 1990s. Deep charcoal virgin wool tailored with fluid knife pleats that catch movement effortlessly.",
    images: [
      { url: "/images/prod-pleated-skirt.jpg", alt: "Charcoal Virgin Wool Pleated Midi Skirt" },
      { url: "/images/cat-women.jpg", alt: "Minimalist womenswear styling" },
    ],
  },
  {
    id: "prod-7",
    name: "1980s Melton Wool & Cream Sleeve Varsity Jacket",
    slug: "1980s-melton-wool-cream-sleeve-varsity-jacket",
    brand: "Golden Bear Archive",
    categorySlug: "jackets",
    collectionSlugs: ["streetwear", "statement-pieces"],
    gender: "UNISEX",
    price: 7999,
    originalPrice: null,
    originalPriceVerified: false,
    size: "L",
    measurements: {
      chest: "46 in (117 cm)",
      shoulder: "20 in (51 cm)",
      sleeve: "25.5 in (65 cm)",
      length: "26.5 in (67 cm)",
      notes: "Generous boxy heritage fit.",
    },
    condition: "GOOD",
    conditionNotes:
      "Clean charcoal melton wool; subtle creamy patina on leather sleeves consistent with 1980s age.",
    material: "24oz Melton Wool Body, Cowhide Sleeves, Quilted Satin Lining",
    era: "1980s",
    color: "Charcoal & Warm Cream",
    stockQuantity: 1,
    sku: "TN-ARC-007",
    featured: true,
    description:
      "Logo-free American collegiate outerwear at its purest. Heavyweight charcoal melton wool paired with supple cream leather sleeves and tonal knit trim.",
    images: [
      { url: "/images/prod-varsity.jpg", alt: "1980s Melton Wool Varsity Jacket" },
      { url: "/images/editorial-2.jpg", alt: "Outerwear editorial portrait" },
    ],
  },
  {
    id: "prod-8",
    name: "Italian Cream Raw Silk & Linen Shirt",
    slug: "italian-cream-raw-silk-linen-shirt",
    brand: "Lemaire Archive",
    categorySlug: "shirts",
    collectionSlugs: ["everyday-classics", "vintage-essentials"],
    gender: "MEN",
    price: 4499,
    originalPrice: 24000,
    originalPriceVerified: true,
    size: "M / L",
    measurements: {
      chest: "43 in (109 cm)",
      shoulder: "18.5 in (47 cm)",
      sleeve: "25 in (63.5 cm)",
      length: "30 in (76 cm)",
      notes: "Relaxed French placket with mother-of-pearl buttons.",
    },
    condition: "LIKE_NEW",
    conditionNotes: "Spotless slub silk-linen weave; zero collar wear.",
    material: "60% Raw Silk, 40% Belgian Linen",
    era: "2000s",
    color: "Warm Cream",
    stockQuantity: 1,
    sku: "TN-ARC-008",
    featured: true,
    description:
      "Tailored in Italy from breathable raw silk and linen slub. Softly structured collar and curved hem designed for effortless warm-weather layering.",
    images: [
      { url: "/images/prod-shirt.jpg", alt: "Italian Cream Raw Silk and Linen Shirt" },
      { url: "/images/cat-men.jpg", alt: "Menswear archive styling" },
    ],
  },
  {
    id: "prod-9",
    name: "1990s Heavyweight Sun-Faded Loopwheel Tee",
    slug: "1990s-heavyweight-sun-faded-loopwheel-tee",
    brand: "Warehouse & Co. Japan",
    categorySlug: "t-shirts",
    collectionSlugs: ["streetwear", "everyday-classics"],
    gender: "MEN",
    price: 2499,
    originalPrice: 8500,
    originalPriceVerified: true,
    size: "L",
    measurements: {
      chest: "44 in (112 cm)",
      shoulder: "19.5 in (49.5 cm)",
      sleeve: "9 in (23 cm)",
      length: "27.5 in (70 cm)",
      notes: "Tubular knit body with zero side seams.",
    },
    condition: "GOOD",
    conditionNotes: "Organic sun-faded charcoal wash; crisp bound neckline.",
    material: "100% Wakayama Loopwheel Cotton (280 GSM)",
    era: "1990s",
    color: "Sun-Faded Charcoal",
    stockQuantity: 1,
    sku: "TN-ARC-009",
    featured: false,
    description:
      "Knitted slowly on vintage Tsuri-ami loopwheel frames in Japan. Substantial dry-hand cotton with authentic charcoal fade.",
    images: [
      { url: "/images/prod-tshirt.jpg", alt: "1990s Heavyweight Loopwheel Tee" },
      { url: "/images/editorial-2.jpg", alt: "Streetwear archive styling" },
    ],
  },
  {
    id: "prod-10",
    name: "Sand-Champagne Bias-Cut Silk Slip Dress",
    slug: "sand-champagne-bias-cut-silk-slip-dress",
    brand: "Narciso Rodriguez Vintage",
    categorySlug: "dresses",
    collectionSlugs: ["statement-pieces", "vintage-essentials"],
    gender: "WOMEN",
    price: 6999,
    originalPrice: 42000,
    originalPriceVerified: true,
    size: "S / M",
    measurements: {
      chest: "36 in (91.5 cm)",
      waist: "30 in (76 cm)",
      hip: "40 in (101.5 cm)",
      length: "47 in (119.5 cm)",
      notes: "Bias cut skims the body fluidly.",
    },
    condition: "LIKE_NEW",
    conditionNotes: "Immaculate silk-crepe sheen; zero snags or pulls.",
    material: "100% Heavyweight Silk Crepe de Chine",
    era: "Late 1990s",
    color: "Warm Champagne Sand",
    stockQuantity: 1,
    sku: "TN-ARC-010",
    featured: true,
    description:
      "An architectural late-1990s bias-cut midi slip dress in liquid sand silk crepe. Clean square-cut straps and understated French seams.",
    images: [
      { url: "/images/prod-dress.jpg", alt: "Sand-Champagne Bias-Cut Silk Slip Dress" },
      { url: "/images/cat-women.jpg", alt: "Womenswear editorial look" },
    ],
  },
  {
    id: "prod-11",
    name: "Oatmeal Merino Fine-Knit Mock-Neck Top",
    slug: "oatmeal-merino-fine-knit-mock-neck-top",
    brand: "Toteme Archive",
    categorySlug: "tops",
    collectionSlugs: ["everyday-classics", "vintage-essentials"],
    gender: "WOMEN",
    price: 3499,
    originalPrice: 17500,
    originalPriceVerified: true,
    size: "S",
    measurements: {
      chest: "35 in (89 cm)",
      shoulder: "14.5 in (37 cm)",
      length: "22.5 in (57 cm)",
      notes: "Ribbed mock collar with gentle stretch.",
    },
    condition: "EXCELLENT",
    conditionNotes: "Zero pilling; soft lofted merino hand-feel.",
    material: "100% Extra-Fine Australian Merino Wool",
    era: "2010s",
    color: "Oatmeal Ivory",
    stockQuantity: 1,
    sku: "TN-ARC-011",
    featured: false,
    description:
      "Minimalist sleeveless mock-neck knit designed for effortless layering under tailored blazers or wearing solo with wide trousers.",
    images: [
      { url: "/images/prod-top.jpg", alt: "Oatmeal Merino Fine-Knit Mock-Neck Top" },
      { url: "/images/editorial-1.jpg", alt: "Editorial knitwear styling" },
    ],
  },
  {
    id: "prod-12",
    name: "1990s Straight-Leg Washed Selvedge Jeans",
    slug: "1990s-straight-leg-washed-selvedge-jeans",
    brand: "Levi's Vintage Clothing",
    categorySlug: "denim",
    collectionSlugs: ["denim-collection", "vintage-essentials"],
    gender: "UNISEX",
    price: 4799,
    originalPrice: 19500,
    originalPriceVerified: true,
    size: "30 / M",
    measurements: {
      waist: "30 in (76 cm)",
      hip: "41 in (104 cm)",
      inseam: "30.5 in (77.5 cm)",
      length: "41 in (104 cm)",
      notes: "Mid-to-high rise straight leg with red-line selvedge outseam.",
    },
    condition: "GOOD",
    conditionNotes: "Natural vintage indigo fade and intact chain-stitched hem.",
    material: "100% 13.5oz Cone Mills Selvedge Denim",
    era: "1990s",
    color: "Washed Vintage Indigo",
    stockQuantity: 1,
    sku: "TN-ARC-012",
    featured: false,
    description:
      "Authentic straight-leg 1990s selvedge denim broken in over decades. Features copper rivets, hidden back-pocket bar tacks, and clean selvedge cuff.",
    images: [
      { url: "/images/prod-selvedge-jeans.jpg", alt: "1990s Straight-Leg Washed Selvedge Jeans" },
      { url: "/images/story-archive.jpg", alt: "Curated denim archive" },
    ],
  },
  {
    id: "prod-13",
    name: "Unstructured Belgian Sand Linen Jacket",
    slug: "unstructured-belgian-sand-linen-jacket",
    brand: "Boglioli Archive",
    categorySlug: "jackets",
    collectionSlugs: ["everyday-classics", "statement-pieces"],
    gender: "MEN",
    price: 6899,
    originalPrice: 38000,
    originalPriceVerified: true,
    size: "M",
    measurements: {
      chest: "42 in (107 cm)",
      shoulder: "18 in (46 cm)",
      sleeve: "24.5 in (62 cm)",
      length: "29 in (73.5 cm)",
      notes: "Unlined soft-shoulder Italian construction.",
    },
    condition: "LIKE_NEW",
    conditionNotes: "Freshly steamed; natural linen slub intact.",
    material: "100% Belgian Flax Linen",
    era: "2010s",
    color: "Warm Sand",
    stockQuantity: 1,
    sku: "TN-ARC-013",
    featured: false,
    description:
      "Garment-dyed unstructured two-button jacket cut from heavy Belgian linen. Effortless drape suited to humid evenings and tailored separates.",
    images: [
      { url: "/images/prod-linen-blazer.jpg", alt: "Unstructured Belgian Sand Linen Jacket" },
      { url: "/images/cat-men.jpg", alt: "Menswear linen styling" },
    ],
  },
];

export function getFallbackCatalog(): ProductDetailItem[] {
  const categoryMap = new Map(SEED_CATEGORIES.map((c) => [c.slug, c]));
  const collectionMap = new Map(SEED_COLLECTIONS.map((c) => [c.slug, c]));

  return SEED_PRODUCTS.map((p, index) => {
    const category = categoryMap.get(p.categorySlug) ?? SEED_CATEGORIES[0];
    const collections = p.collectionSlugs
      .map((s) => collectionMap.get(s))
      .filter((c): c is CollectionSummary => Boolean(c));

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      gender: p.gender,
      price: p.price,
      originalPrice: p.originalPrice,
      originalPriceVerified: p.originalPriceVerified,
      size: p.size,
      condition: p.condition,
      conditionNotes: p.conditionNotes,
      material: p.material,
      era: p.era,
      color: p.color,
      stockQuantity: p.stockQuantity,
      sku: p.sku,
      featured: p.featured,
      description: p.description,
      measurements: p.measurements,
      category,
      collections,
      images: p.images.map((img, i) => ({
        id: `${p.id}-img-${i}`,
        url: img.url,
        alt: img.alt,
        sortOrder: i,
      })),
      createdAt: new Date(Date.UTC(2026, 10, 11) - index * 86400000).toISOString(),
    };
  });
}

