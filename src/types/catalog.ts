import { ConditionGrade, Gender } from "@prisma/client";

export interface GarmentMeasurements {
  chest?: string;
  waist?: string;
  hip?: string;
  shoulder?: string;
  sleeve?: string;
  length?: string;
  inseam?: string;
  notes?: string;
}

export interface ProductImageItem {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  gender: Gender | null;
}

export interface CollectionSummary {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  featured: boolean;
}

export interface ProductCardItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  gender: Gender;
  price: number;
  originalPrice: number | null;
  originalPriceVerified: boolean;
  size: string;
  condition: ConditionGrade;
  stockQuantity: number;
  featured: boolean;
  era: string | null;
  material: string;
  category: CategorySummary;
  images: ProductImageItem[];
  collections: CollectionSummary[];
}

export interface ProductDetailItem extends ProductCardItem {
  description: string;
  conditionNotes: string | null;
  color: string | null;
  sku: string;
  measurements: GarmentMeasurements;
  createdAt: string;
}

export interface EditorialArticle {
  id: string;
  issue: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
  readTime: string;
}

export interface SiteSettingsData {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  instagramUrl: string;
  storeAddress: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  codEnabled: boolean;
  codFee: number;
  razorpayEnabled: boolean;
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImage: string;
  editorialContent: EditorialArticle[];
}

