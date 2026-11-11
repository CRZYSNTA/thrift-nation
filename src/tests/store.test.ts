import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  formatINR,
  slugify,
  CONDITION_LABELS,
  generateOrderNumber,
} from "../lib/utils";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "../lib/razorpay";
import { getProducts, getProductBySlug, getCollections } from "../lib/catalog";
import { SEED_PRODUCTS } from "../lib/seed-data";

test("formatINR formats Indian Rupees without decimals", () => {
  assert.equal(formatINR(8999), "₹8,999");
  assert.equal(formatINR(12499), "₹12,499");
  assert.equal(formatINR(499), "₹499");
});

test("slugify normalizes titles cleanly", () => {
  assert.equal(
    slugify("1990s Double-Breasted Gabardine Trench Coat!"),
    "1990s-double-breasted-gabardine-trench-coat"
  );
});

test("generateOrderNumber produces TN-prefixed unique order numbers", () => {
  const num = generateOrderNumber();
  assert.match(num, /^TN-\d{4}-\d{7}$/);
});

test("CONDITION_LABELS covers all four condition grades", () => {
  assert.equal(CONDITION_LABELS.LIKE_NEW, "Like New");
  assert.equal(CONDITION_LABELS.EXCELLENT, "Excellent");
  assert.equal(CONDITION_LABELS.GOOD, "Good");
  assert.equal(CONDITION_LABELS.FAIR, "Fair");
});

test("Razorpay payment signature verification validates authentic HMAC-SHA256 signatures and rejects tampering", () => {
  const prevSecret = process.env.RAZORPAY_KEY_SECRET;
  process.env.RAZORPAY_KEY_SECRET = "test_razorpay_secret_key";

  try {
    const orderId = "order_test_123";
    const paymentId = "pay_test_456";
    const validSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    assert.equal(
      verifyRazorpayPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSig,
      }),
      true
    );

    assert.equal(
      verifyRazorpayPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: "0".repeat(validSig.length),
      }),
      false
    );
  } finally {
    if (prevSecret === undefined) delete process.env.RAZORPAY_KEY_SECRET;
    else process.env.RAZORPAY_KEY_SECRET = prevSecret;
  }
});

test("Razorpay webhook signature verification validates raw body HMAC", () => {
  const prevSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret_key";

  try {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const sig = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    assert.equal(verifyRazorpayWebhookSignature(rawBody, sig), true);
    assert.equal(verifyRazorpayWebhookSignature(rawBody + " ", sig), false);
  } finally {
    if (prevSecret === undefined) delete process.env.RAZORPAY_WEBHOOK_SECRET;
    else process.env.RAZORPAY_WEBHOOK_SECRET = prevSecret;
  }
});

test("Seed catalog has unique slugs, unique SKUs, 1-of-1 stock, and existing local images", () => {
  const slugs = new Set<string>();
  const skus = new Set<string>();

  for (const prod of SEED_PRODUCTS) {
    assert.ok(!slugs.has(prod.slug), `Duplicate slug: ${prod.slug}`);
    assert.ok(!skus.has(prod.sku), `Duplicate SKU: ${prod.sku}`);
    slugs.add(prod.slug);
    skus.add(prod.sku);
    assert.ok(prod.stockQuantity >= 1);
    assert.ok(prod.images.length >= 1);

    for (const img of prod.images) {
      const filePath = path.join(process.cwd(), "public", img.url.replace(/^\//, ""));
      assert.ok(
        fs.existsSync(filePath),
        `Missing image asset on disk: ${filePath}`
      );
    }
  }
});

test("Catalog queries filter by gender, collection, price, search, and sort correctly", async () => {
  const menItems = await getProducts({ gender: "MEN" });
  assert.ok(menItems.length > 0);
  assert.ok(menItems.every((p) => p.gender === "MEN" || p.gender === "UNISEX"));

  const womenItems = await getProducts({ gender: "WOMEN" });
  assert.ok(womenItems.length > 0);
  assert.ok(
    womenItems.every((p) => p.gender === "WOMEN" || p.gender === "UNISEX")
  );

  const sortedAsc = await getProducts({ sort: "price-asc" });
  for (let i = 1; i < sortedAsc.length; i++) {
    assert.ok(sortedAsc[i].price >= sortedAsc[i - 1].price);
  }

  const sortedDesc = await getProducts({ sort: "price-desc" });
  for (let i = 1; i < sortedDesc.length; i++) {
    assert.ok(sortedDesc[i].price <= sortedDesc[i - 1].price);
  }

  const trenchResults = await getProducts({ search: "trench" });
  assert.ok(trenchResults.some((p) => p.slug.includes("trench")));

  const detail = await getProductBySlug(
    "1990s-double-breasted-gabardine-trench-coat"
  );
  assert.ok(detail);
  assert.equal(detail.sku, "TN-ARC-001");

  const collections = await getCollections();
  assert.equal(collections.length, 5);
});

