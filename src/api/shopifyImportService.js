import { getConnectedShopifyStore } from "./shopifyService.js";

// 🔄 Toggle: Demo ke liye `true` rakhein, real backend ke liye `false` kar dein
export const USE_MOCK_BACKEND = true;

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const IMPORTED_PRODUCTS_KEY = "amazonmap_imported_products";
const IMPORT_STATS_KEY = "amazonmap_import_stats";

// Mock catalog with rich Shopify GraphQL + Deep REST attributes
const MOCK_SHOPIFY_PRODUCTS = [
  {
    shopifyProductId: "849201101",
    title: "  AURORA WIRELESS HEADPHONES  ",
    sku: "SKU-1200",
    category: "Audio",
    inventory: 42,
    price: 189.0,
    vendor: "Aurora Audio",
    body_html:
      "<p>Studio-grade <b>active noise cancelling</b> wireless headphones with 40-hour battery life and memory foam earcups.</p>",
    tags: "audio, wireless, bluetooth, noise-cancelling",
    weight: 0.32,
    weight_unit: "kg",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=96&q=60",
    importType: "new",
  },
  {
    shopifyProductId: "849201102",
    title: "Nomad Leather Watch Strap",
    sku: "N/A", // Missing SKU -> auto-reconciled in Data Cleaning
    category: "Accessories",
    inventory: 18,
    price: 49.5,
    vendor: "", // Missing Brand -> flagged for manual edit in Data Cleaning
    body_html:
      "<div>Handcrafted <i>vegetable-tanned Horween leather</i> strap compatible with 42mm/44mm/45mm watches.</div>",
    tags: "watch-strap, leather, accessories",
    weight: 0.08,
    weight_unit: "kg",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=96&q=60",
    importType: "new",
  },
  {
    shopifyProductId: "849201103",
    title: "Trailrunner GTX Sneakers",
    sku: "SKU-1214",
    category: "Footwear",
    inventory: 29,
    price: 139.0,
    vendor: "Trailrunner",
    body_html:
      "<p>Waterproof Gore-Tex membrane trail sneakers with high-traction Vibram outsole.</p>",
    tags: "footwear, running, waterproof, outdoor",
    weight: 0.78,
    weight_unit: "kg",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=96&q=60",
    importType: "changed",
  },
  {
    shopifyProductId: "849201104",
    title: "MERIDIAN SMART WATCH",
    sku: "SKU-1221",
    category: "Wearables",
    inventory: 64,
    price: 249.0,
    vendor: "Meridian Labs",
    body_html:
      "<ul><li>1.4-inch AMOLED display</li><li>Built-in dual-band GPS &amp; SpO2 monitor</li></ul>",
    tags: "smartwatch, fitness, gps, wearables",
    weight: 0.11,
    weight_unit: "kg",
    imageUrl:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=96&q=60",
    importType: "changed",
  },
  {
    shopifyProductId: "849201105",
    title: "Field Canvas Backpack",
    sku: "SKU-1228",
    category: "Bags",
    inventory: 51,
    price: 0, // Price <= 0 -> triggers warning
    vendor: "Northwind Supply",
    body_html:
      "<p>Heavy-duty 16oz waxed cotton canvas backpack with padded 16-inch laptop sleeve.</p>",
    tags: "backpack, travel, canvas, everyday",
    weight: 0.95,
    weight_unit: "kg",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=96&q=60",
    importType: "new",
  },
  {
    shopifyProductId: "849201106",
    title: "Halo Minimal Desk Lamp",
    sku: "SKU-1235",
    category: "Home",
    inventory: 33,
    price: 74.0,
    vendor: "Halo Living",
    body_html:
      "<p>Stepless dimming aluminum LED desk lamp with warm-to-cool color temperature control.</p>",
    tags: "lighting, desk-lamp, workspace, home",
    weight: 1.15,
    weight_unit: "kg",
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=96&q=60",
    importType: "unchanged",
  },
  {
    shopifyProductId: "849201107",
    title: "Pulse Fitness Tracker",
    sku: "SKU-1242",
    category: "Wearables",
    inventory: 75,
    price: 119.0,
    vendor: "Pulse Health",
    body_html:
      "<p>24/7 heart rate, sleep stage tracking, and 14-day battery life in an ultra-light band.</p>",
    tags: "fitness-tracker, health, wearable",
    weight: 0.04,
    weight_unit: "kg",
    imageUrl:
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=96&q=60",
    importType: "unchanged",
  },
  {
    shopifyProductId: "849201108",
    title: "Cobalt Bluetooth Speaker",
    sku: "SKU-1249",
    category: "Audio",
    inventory: 22,
    price: 129.0,
    vendor: "", // Missing Brand -> flagged for manual edit
    body_html:
      "<p>IP67 waterproof 360-degree portable speaker with deep bass radiators.</p>",
    tags: "speaker, portable, waterproof, audio",
    weight: 0.62,
    weight_unit: "kg",
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=96&q=60",
    importType: "new",
  },
];

// Normalize product object while preserving deep attributes for Import -> Cleaning -> AI Mapping
export const normalizeProductItem = (item, index = 0) => ({
  shopifyProductId: String(
    item.shopifyProductId || item.id || `prod_${index + 1}`
  ),
  title: item.title || "Untitled Product",
  sku: item.sku || "N/A",
  category: item.category || "Uncategorized",
  inventory: Number(item.inventory ?? 0),
  price: Number(item.price ?? 0),
  imageUrl: item.imageUrl || item.image || null,
  importType: item.importType || "new",
  status: item.status || "Ready",
  // Deep attributes attached from mock/REST source
  vendor: item.vendor ?? "",
  body_html: item.body_html ?? "",
  tags: item.tags ?? "",
  weight: item.weight ?? 0.5,
  weight_unit: item.weight_unit || "kg",
});

export const getSavedImportedProducts = (workspaceId) => {
  try {
    const all = JSON.parse(localStorage.getItem(IMPORTED_PRODUCTS_KEY) || "{}");
    return all[workspaceId] || [];
  } catch {
    return [];
  }
};

export const getSavedImportStats = (workspaceId) => {
  try {
    const all = JSON.parse(localStorage.getItem(IMPORT_STATS_KEY) || "{}");
    return all[workspaceId] || null;
  } catch {
    return null;
  }
};

// 1. Fetch Shopify Products
export const fetchShopifyProductsApi = async (
  { workspaceId, limit = 50 },
  accessToken
) => {
  if (!USE_MOCK_BACKEND && accessToken && workspaceId) {
    const url = `${API_BASE_URL}/shopify/products?workspaceId=${encodeURIComponent(
      workspaceId
    )}&limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to fetch products from Shopify.");
    }

    const data = await response.json();
    const existingSaved = getSavedImportedProducts(workspaceId);
    const existingIds = new Set(existingSaved.map((p) => p.shopifyProductId));

    return (data.products || []).map((item, idx) => {
      const normalized = normalizeProductItem(item, idx);
      return {
        ...normalized,
        importType: existingIds.has(normalized.shopifyProductId)
          ? "changed"
          : "new",
      };
    });
  }

  // Mock Mode
  await new Promise((r) => setTimeout(r, 500));
  const existingSaved = getSavedImportedProducts(workspaceId);
  const existingIds = new Set(existingSaved.map((p) => p.shopifyProductId));

  return MOCK_SHOPIFY_PRODUCTS.map((item, idx) => {
    const normalized = normalizeProductItem(item, idx);
    return {
      ...normalized,
      importType: existingIds.has(normalized.shopifyProductId)
        ? "unchanged"
        : normalized.importType,
    };
  });
};

// 2. Import Selected Products (Saves full rawShopifyData deep attributes)
export const importSelectedProductsApi = async (
  { workspaceId, selectedProducts },
  accessToken
) => {
  const payloadProducts = selectedProducts.map((item) => ({
    shopifyProductId: item.shopifyProductId,
    title: item.title,
    sku: item.sku || "N/A",
    category: item.category || "Uncategorized",
    inventory: Number(item.inventory || 0),
    price: Number(item.price || 0),
    imageUrl: item.imageUrl || null,
  }));

  let statsResult = null;

  if (!USE_MOCK_BACKEND && accessToken && workspaceId) {
    const response = await fetch(`${API_BASE_URL}/shopify/start-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        workspaceId,
        selectedProducts: payloadProducts,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Shopify import failed");
    }
    statsResult = data.stats;
  } else {
    // Mock Mode calculation
    await new Promise((r) => setTimeout(r, 750));

    const previousList = getSavedImportedProducts(workspaceId);
    const previousMap = new Map(
      previousList.map((p) => [p.shopifyProductId, p])
    );

    let created = 0;
    let updated = 0;
    let warnings = 0;

    for (const item of payloadProducts) {
      if (!item.sku || item.sku === "N/A" || item.price <= 0) {
        warnings += 1;
      }
      if (previousMap.has(item.shopifyProductId)) {
        updated += 1;
      } else {
        created += 1;
      }
    }

    statsResult = {
      workspaceId,
      fetched: payloadProducts.length,
      created,
      updated,
      warnings,
      createdAt: new Date().toISOString(),
    };
  }

  // Save full deep rawShopifyData locally so Data Cleaning shows all deep fields
  const mockLookup = new Map(
    MOCK_SHOPIFY_PRODUCTS.map((m) => [m.shopifyProductId, m])
  );
  const previousList = getSavedImportedProducts(workspaceId);
  const mergedMap = new Map(previousList.map((p) => [p.shopifyProductId, p]));

  selectedProducts.forEach((p) => {
    const deepMeta = mockLookup.get(p.shopifyProductId) || p;
    mergedMap.set(p.shopifyProductId, {
      _id: p._id || p.shopifyProductId,
      shopifyProductId: p.shopifyProductId,
      title: p.title,
      sku: p.sku || "N/A",
      category: p.category || "Uncategorized",
      inventory: Number(p.inventory || 0),
      price: Number(p.price || 0),
      imageUrl: p.imageUrl || null,
      status: "Imported",
      rawShopifyData: {
        id: p.shopifyProductId,
        title: p.title,
        vendor: deepMeta.vendor ?? "",
        body_html:
          deepMeta.body_html ||
          `<p>Authentic ${p.title.trim()} from our ${p.category} collection.</p>`,
        product_type: p.category || "Uncategorized",
        tags: deepMeta.tags || `${(p.category || "general").toLowerCase()}, shopify`,
        image: p.imageUrl ? { src: p.imageUrl } : null,
        variants: [
          {
            sku: p.sku || "N/A",
            price: String(p.price ?? 0),
            inventory_quantity: Number(p.inventory ?? 0),
            weight: deepMeta.weight ?? 0.5,
            weight_unit: deepMeta.weight_unit || "kg",
          },
        ],
      },
    });
  });

  const updatedCatalog = Array.from(mergedMap.values());

  try {
    const allProducts = JSON.parse(
      localStorage.getItem(IMPORTED_PRODUCTS_KEY) || "{}"
    );
    allProducts[workspaceId] = updatedCatalog;
    localStorage.setItem(IMPORTED_PRODUCTS_KEY, JSON.stringify(allProducts));

    const allStats = JSON.parse(
      localStorage.getItem(IMPORT_STATS_KEY) || "{}"
    );
    allStats[workspaceId] = statsResult;
    localStorage.setItem(IMPORT_STATS_KEY, JSON.stringify(allStats));
  } catch {
    // Ignore storage errors
  }

  // Clear previous cleaning audit cache so Data Cleaning analyzes the newly imported products
  try {
    const allAudits = JSON.parse(
      localStorage.getItem("amazonmap_cleaning_audit") || "{}"
    );
    delete allAudits[workspaceId];
    localStorage.setItem("amazonmap_cleaning_audit", JSON.stringify(allAudits));
  } catch {
    // Ignore
  }

  return {
    message: "Import complete",
    stats: statsResult,
    importedProducts: updatedCatalog,
  };
};