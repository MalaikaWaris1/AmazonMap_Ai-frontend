const delay = (data, ms = 500 + Math.random() * 700) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

const img = (seed) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=96&q=60`;

const IMAGES = [
  img("1505740420928-5e560c06d30e"),
  img("1523275335684-37898b6baf30"),
  img("1526170375885-4d8ecf77b99f"),
  img("1542291026-7eec264c27ff"),
  img("1546868871-7041f2a55e12"),
  img("1560343090-f0409e92791a"),
  img("1553062407-98eeb64c6a62"),
  img("1585386959984-a4155224a1ad"),
];

const TITLES = [
  ["Aurora Wireless Headphones", "Audio", 189],
  ["Nomad Leather Watch Strap", "Accessories", 49.5],
  ["Trailrunner GTX Sneakers", "Footwear", 139],
  ["Meridian Smart Watch", "Wearables", 249],
  ["Field Canvas Backpack", "Bags", 89],
  ["Halo Desk Lamp", "Home", 74],
  ["Pulse Fitness Tracker", "Wearables", 119],
  ["Verge Ceramic Mug Set", "Home", 34],
  ["Stratos Sunglasses", "Accessories", 96],
  ["Cobalt Bluetooth Speaker", "Audio", 129],
  ["Drift Linen Shirt", "Apparel", 68],
  ["Summit Water Bottle", "Outdoor", 28],
];

const STATUSES = ["Normalized", "Missing Value Detected", "Unchanged"];

export const PRODUCTS = TITLES.map(([title, category, price], i) => ({
  id: `p${i + 1}`,
  title,
  sku: `SKU-${1200 + i * 7}`,
  price,
  image: IMAGES[i % IMAGES.length],
  status: i % 5 === 0 ? "Raw" : STATUSES[i % STATUSES.length],
  category,
}));

const series = (n, base, spread) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: Math.round(base + Math.sin(i / 1.7) * spread + i * 2.4),
  }));

export const apiService = {
  // ===== Dashboard insights (weekly / monthly) =====
  getDashboardInsights: (range) => {
    const multiplier = range === "weekly" ? 1 : 4;
    const weekly = range === "weekly";
    const count = (n) => Math.round(n * multiplier);
    return delay({
      range,
      summary: [
        { label: "Products imported", value: count(312).toLocaleString(), change: weekly ? "+12.4%" : "+18.2%", direction: "up", tone: "primary" },
        { label: "Listings published", value: count(258).toLocaleString(), change: weekly ? "+8.9%" : "+14.6%", direction: "up", tone: "success" },
        { label: "Awaiting review", value: String(weekly ? 86 : 61), change: weekly ? "−4.1%" : "−11.3%", direction: "down", tone: "warning" },
        { label: "Sync errors", value: String(weekly ? 14 : 42), change: weekly ? "+2" : "−6", direction: weekly ? "up" : "down", tone: "destructive" },
      ],
      throughput: (weekly ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["W1", "W2", "W3", "W4"]).map((label, i) => ({
        label,
        imported: Math.round((weekly ? 38 : 272) + i * (weekly ? 3 : 23) + Math.sin(i * 1.4) * (weekly ? 10 : 28)),
        cleaned: Math.round((weekly ? 31 : 232) + i * (weekly ? 3 : 21) + Math.sin(i * 1.4) * (weekly ? 8 : 25)),
        published: Math.round((weekly ? 27 : 210) + i * (weekly ? 2 : 19) + Math.sin(i * 1.4) * (weekly ? 7 : 21)),
      })),
      stages: [
        { label: "Shopify import", description: "Products fetched from store", count: count(312), total: count(312), change: "+12.4%", path: "/import", tone: "primary" },
        { label: "Data cleaning", description: "Products cleaned & normalized", count: count(287), total: count(312), change: "+9.8%", path: "/clean", tone: "success" },
        { label: "AI + rule mapping", description: "Fields mapped to Amazon", count: count(274), total: count(312), change: "+7.2%", path: "/mapping", tone: "primary" },
        { label: "Seller review", description: "Listings ready for approval", count: count(226), total: count(312), change: weekly ? "86 pending" : "61 pending", path: "/review", tone: "warning" },
        { label: "Amazon publishing", description: "Live Amazon listings", count: count(258), total: count(312), change: weekly ? "14 errors" : "42 errors", path: "/publish", tone: "destructive" },
      ],
      categories: [
        { name: "Electronics", listings: count(94) },
        { name: "Accessories", listings: count(68) },
        { name: "Home", listings: count(51) },
        { name: "Apparel", listings: count(45) },
      ],
      health: [
        { name: "Published", value: count(258), tone: "success" },
        { name: "In review", value: weekly ? 86 : 61, tone: "warning" },
        { name: "Errors", value: weekly ? 14 : 42, tone: "destructive" },
      ],
    });
  },

  getKpis: () =>
    delay([
      { label: "Total Products Imported", value: "1,248", delta: "+12.4%", trend: "up", spark: series(12, 40, 8) },
      { label: "Products Awaiting Review", value: "86", delta: "-4.1%", trend: "down", spark: series(12, 30, 12) },
      { label: "Sync Errors (Repair Loop)", value: "14", delta: "+2 today", trend: "up", spark: series(12, 12, 6) },
      { label: "Active Amazon Listings", value: "1,032", delta: "+8.9%", trend: "up", spark: series(12, 55, 10) },
    ]),

  getSyncPerformance: (range) =>
    delay(
      (range === "weekly"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]
      ).map((label, i) => ({
        label,
        synced: Math.round(120 + Math.sin(i / 1.3) * 45 + i * (range === "weekly" ? 9 : 22)),
        failed: Math.round(18 + Math.cos(i / 1.1) * 8),
      }))
    ),

  getActivity: () =>
    delay([
      { id: "a1", message: "AI mapped 50 products to Amazon categories", time: "2 min ago", tone: "success" },
      { id: "a2", message: "Validation failed for SKU-1235 — missing Material", time: "14 min ago", tone: "warning" },
      { id: "a3", message: "Published 10 items to Amazon Seller Central", time: "41 min ago", tone: "success" },
      { id: "a4", message: "Error 8560 returned for SKU-1249", time: "1 hr ago", tone: "danger" },
      { id: "a5", message: "Shopify catalog re-synced (1,248 products)", time: "3 hrs ago", tone: "info" },
      { id: "a6", message: "Rule Engine updated: Brand → brand_name", time: "5 hrs ago", tone: "info" },
    ]),

  // ===== Data Cleaning & Audit (Module 4) =====
  getCleaningStats: () =>
    delay([
      { label: "Missing Values Detected", count: 37, pct: 3, bars: [6, 9, 4, 11, 7] },
      { label: "Formatting Normalized", count: 914, pct: 73, bars: [12, 18, 15, 22, 19] },
      { label: "SKUs Reconciled", count: 1248, pct: 100, bars: [20, 22, 21, 24, 23] },
    ]),

  getCleaningComparison: (productId) => {
    const p = PRODUCTS.find((x) => x.id === productId) ?? PRODUCTS[0];
    return delay(
      {
        raw: [
          { field: "Title", value: `  ${p.title.toUpperCase()}  ` },
          { field: "Price", value: `${p.price} usd` },
          { field: "Brand", value: "northwind  supply" },
          { field: "Weight", value: "—" },
          { field: "Color", value: "blk" },
        ],
        cleaned: [
          { field: "Title", value: p.title },
          { field: "Price", value: `$${p.price.toFixed(2)}` },
          { field: "Brand", value: "Northwind Supply" },
          { field: "Weight", value: "Missing" },
          { field: "Color", value: "Black" },
        ],
      },
      450
    );
  },

  // ===== AI + Rule Mapping (Modules 5 & 6) =====
  getMappings: () =>
    delay(
      PRODUCTS.slice(0, 6).map((p) => ({
        productId: p.id,
        title: p.title,
        shopify: [
          { field: "title", value: p.title },
          { field: "vendor", value: "Northwind Supply" },
          { field: "product_type", value: p.category },
          { field: "variant_price", value: `$${p.price.toFixed(2)}` },
          { field: "sku", value: p.sku },
          { field: "body_html", value: "Premium build, 2-year warranty…" },
        ],
        amazon: [
          { field: "item_name", value: p.title, source: "AI", confidence: 96 },
          { field: "brand_name", value: "Northwind Supply", source: "RULE", confidence: null },
          { field: "product_category", value: p.category, source: "AI", confidence: 91 },
          { field: "standard_price", value: `$${p.price.toFixed(2)}`, source: "RULE", confidence: null },
          { field: "seller_sku", value: p.sku, source: "RULE", confidence: null },
          { field: "bullet_point_1", value: "Premium build with 2-year warranty", source: "AI", confidence: 88 },
          { field: "item_type_keyword", value: `${p.category.toLowerCase()}-general`, source: "AI", confidence: 74 },
        ],
      }))
    ),

  // ===== Seller Review & Validation (Modules 7 & 8) =====
  getReviewQueue: () =>
    delay({
      ready: PRODUCTS.slice(0, 7).map((p) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        image: p.image,
      })),
      attention: PRODUCTS.slice(7, 12).map((p, i) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        image: p.image,
        missingField: ["Material", "Item Type Keyword", "Country of Origin", "Age Range", "Fabric Type"][i],
        message: [
          "Amazon requires 'Material' for this product category",
          "Amazon requires 'Item Type Keyword' to classify this listing",
          "Amazon requires 'Country of Origin' for import compliance",
          "Amazon requires 'Age Range' for this category",
          "Amazon requires 'Fabric Type' for apparel listings",
        ][i],
      })),
    }),

  // ===== Amazon Publishing (Module 9) =====
  getPublishQueue: () =>
    delay({
      queue: PRODUCTS.slice(0, 8).map((p) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        image: p.image,
      })),
      errors: PRODUCTS.slice(8, 12).map((p, i) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        image: p.image,
        code: ["Error 8560", "Error 90220", "Error 5665", "Error 8541"][i],
        message: [
          "Missing Item Type Keyword",
          "Invalid value for standard_price",
          "Brand is not registered in Brand Registry",
          "Bullet point exceeds 500 characters",
        ][i],
      })),
      summary: { total: 12, published: 8, failed: 4 },
    }),

  publishProduct: (id) => delay({ ok: true, id }, 700),

  // ===== Fallback for DashboardPage Account Connections =====
  getSettings: () =>
    delay({
      accounts: [
        { name: "Shopify", detail: "northwind-supply.myshopify.com", connected: true },
        { name: "Amazon SP-API", detail: "Seller ID A2XK…9PQ1", connected: true },
      ],
    }),
};