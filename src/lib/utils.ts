import { ConditionGrade, Gender } from "@prisma/client";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const CONDITION_LABELS: Record<ConditionGrade, string> = {
  LIKE_NEW: "Like New",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
};

export const CONDITION_DESCRIPTIONS: Record<ConditionGrade, string> = {
  LIKE_NEW: "Unworn or shows zero visible signs of wear. Crisp structure and original finish.",
  EXCELLENT: "Gently pre-loved with minimal wear; thoroughly cleaned, steamed, and inspected.",
  GOOD: "Authentic vintage character with subtle patina or minor softened edges.",
  FAIR: "Noticeable vintage wear or subtle repair, priced accordingly and documented honestly.",
};

export const GENDER_LABELS: Record<Gender, string> = {
  MEN: "Men",
  WOMEN: "Women",
  UNISEX: "Unisex",
};

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const suffix = Date.now().toString().slice(-3);
  return `TN-${year}-${rand}${suffix}`;
}

