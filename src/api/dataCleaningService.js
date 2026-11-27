import {
  getSavedImportedProducts,
  USE_MOCK_BACKEND,
} from "./shopifyImportService.js";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const CLEANED_CATALOG_KEY = "amazonmap_cleaned_products";
const CLEANING_AUDIT_KEY = "amazonmap_cleaning_audit";

function buildHeaders(token, includeJson = false) {
  const headers = {};
  if (includeJson) headers["Content-Type"] = "application/json";
  const authToken =
    token ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

async function handleApiResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(
      data.error || data.message || `Server error (${response.status})`
    );
    err.status = response.status;
    throw err;
  }
  return data;
}

// Mirrors exact backend cleanSingleProduct logic + deep Shopify attributes
function runLocalCleanSingleProduct(rawItem, duplicateSkus = new Set()) {
  const missing = [];
  const normalized = [];
  let isNormalized = false;

  const original = {
    title: rawItem.title || "",
    sku: rawItem.sku || "",
    description: rawItem.description || rawItem.body_html || "",
    price: parseFloat(rawItem.price ?? 0),
    brand: rawItem.brand || rawItem.vendor || "",
    category: rawItem.category || rawItem.product_type || "Uncategorized",
    imageUrl: rawItem.imageUrl || "",
    inventoryCount: parseInt(rawItem.inventoryCount ?? 0, 10),
    tags: rawItem.tags || "",
    weight: rawItem.weight ?? null,
    weight_unit: rawItem.weight_unit || "kg",
  };

  let clTitle = original.title.trim();
  let clDescription = original.description
    .replace(/<[^>]*>?/gm, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  let clSku = original.sku.trim();
  let clBrand = original.brand.trim();
  let clPrice = original.price;

  if (clTitle !== original.title) {
    normalized.push("Title Extra Whitespaces");
    isNormalized = true;
  }

  if (clTitle && clTitle === clTitle.toUpperCase()) {
    clTitle = clTitle
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    normalized.push("Caps Lock Re-Formatted");
    isNormalized = true;
  }

  if (clDescription !== original.description) {
    normalized.push("HTML Stripped & Sanitize Data");
    isNormalized = true;
  }

  if (Number.isNaN(clPrice) || clPrice <= 0) {
    missing.push("Price Missing/Null");
    clPrice = 0.0;
  }

  if (!clSku || clSku === "N/A") {
    clSku = `RECON-SKU-${Math.floor(100000 + Math.random() * 900000)}`;
    missing.push("SKU Missing");
  } else if (duplicateSkus.has(clSku)) {
    clSku = `${clSku}-DUPLICATE-${Math.floor(10 + Math.random() * 90)}`;
    normalized.push("Duplicate SKU Reconciled");
    isNormalized = true;
  }

  if (!clBrand) {
    clBrand = "Standard Vendor/Generic";
    missing.push("Brand Unspecified");
  }

  let badge = "Unchanged";
  if (missing.length > 0) {
    badge = "Missing Value Detected";
  } else if (isNormalized) {
    badge = "Normalized";
  }

  return {
    originalData: original,
    cleanedData: {
      title: clTitle,
      sku: clSku,
      description: clDescription,
      price: clPrice,
      brand: clBrand,
      category: original.category,
      imageUrl: original.imageUrl,
      inventoryCount: original.inventoryCount,
      tags: original.tags,
      weight: original.weight,
      weight_unit: original.weight_unit,
    },
    cleaningBadge: badge,
    cleaningSummary: {
      missingFields: missing,
      normalizedFields: normalized,
      reconciliationStatus:
        original.sku !== clSku
          ? "Reconciled & Formatted"
          : "Valid Standardized SKU",
    },
  };
}

function getLocalCleanedList(workspaceId) {
  try {
    const all = JSON.parse(localStorage.getItem(CLEANED_CATALOG_KEY) || "{}");
    return all[workspaceId] || [];
  } catch {
    return [];
  }
}

function saveLocalCleanedList(workspaceId, list) {
  try {
    const all = JSON.parse(localStorage.getItem(CLEANED_CATALOG_KEY) || "{}");
    all[workspaceId] = list;
    localStorage.setItem(CLEANED_CATALOG_KEY, JSON.stringify(all));
  } catch {
    // Ignore storage quota errors
  }
}

function getLocalAudit(workspaceId) {
  try {
    const all = JSON.parse(localStorage.getItem(CLEANING_AUDIT_KEY) || "{}");
    return all[workspaceId] || null;
  } catch {
    return null;
  }
}

function saveLocalAudit(workspaceId, audit) {
  try {
    const all = JSON.parse(localStorage.getItem(CLEANING_AUDIT_KEY) || "{}");
    all[workspaceId] = audit;
    localStorage.setItem(CLEANING_AUDIT_KEY, JSON.stringify(all));
  } catch {
    // Ignore storage quota errors
  }
}

function computeAuditStats(workspaceId, list) {
  const totalCount = list.length;
  if (totalCount === 0) {
    return {
      workspaceId,
      totalProducts: 0,
      missingValuesCount: 0,
      missingValuesPercent: 0,
      formattingNormalizedCount: 0,
      formattingNormalizedPercent: 0,
      skusReconciledCount: 0,
      skusReconciledPercent: 0,
    };
  }

  let missingCount = 0;
  let normalizedCount = 0;
  let skusReconciledCount = 0;

  list.forEach((p) => {
    if (p.cleaningBadge === "Missing Value Detected") missingCount++;
    if (p.cleaningBadge === "Normalized") normalizedCount++;
    if (
      p.cleaningSummary?.reconciliationStatus === "Reconciled & Formatted" ||
      !p.originalData?.sku ||
      p.originalData?.sku === "N/A"
    ) {
      skusReconciledCount++;
    }
  });

  return {
    workspaceId,
    totalProducts: totalCount,
    missingValuesCount: missingCount,
    missingValuesPercent: parseFloat(
      ((missingCount / totalCount) * 100).toFixed(1)
    ),
    formattingNormalizedCount: normalizedCount,
    formattingNormalizedPercent: parseFloat(
      ((normalizedCount / totalCount) * 100).toFixed(1)
    ),
    skusReconciledCount,
    skusReconciledPercent: parseFloat(
      ((skusReconciledCount / totalCount) * 100).toFixed(1)
    ),
  };
}

// =========================================================================
// 1. POST /api/v1/datacleaning/analyze
// =========================================================================
export async function executeDataCleaningPipelineApi({ workspaceId }, token) {
  if (!workspaceId) {
    throw new Error("Workspace ID validation parameter is required.");
  }

  if (!USE_MOCK_BACKEND) {
    const response = await fetch(`${API_BASE_URL}/datacleaning/analyze`, {
      method: "POST",
      headers: buildHeaders(token, true),
      credentials: "include",
      body: JSON.stringify({ workspaceId }),
    });
    return await handleApiResponse(response);
  }

  // Mock Mode: Read imported products & extract ALL deep rawShopifyData attributes
  await new Promise((r) => setTimeout(r, 550));
  const imported = getSavedImportedProducts(workspaceId);

  if (imported.length === 0) {
    const err = new Error("No products found to analyze and clean.");
    err.status = 404;
    throw err;
  }

  const sourceItems = imported.map((item, idx) => {
    const raw = item.rawShopifyData || {};
    const primaryVariant = raw.variants?.[0] || {};
    return {
      _id: item._id || item.shopifyProductId || `prod_${idx + 1}`,
      title: raw.title || item.title || "",
      sku: item.sku || primaryVariant.sku || "",
      price: item.price ?? primaryVariant.price ?? 0,
      brand: raw.vendor || item.vendor || "",
      category: raw.product_type || item.category || "Uncategorized",
      description: raw.body_html || item.body_html || "",
      imageUrl: item.imageUrl || raw.image?.src || "",
      inventoryCount:
        item.inventory ?? primaryVariant.inventory_quantity ?? 0,
      tags: raw.tags || item.tags || "",
      weight: primaryVariant.weight ?? item.weight ?? 0.5,
      weight_unit: primaryVariant.weight_unit || item.weight_unit || "kg",
    };
  });

  const duplicateSkus = new Set();
  const seen = new Set();
  sourceItems.forEach((p) => {
    if (p.sku && p.sku !== "N/A") {
      if (seen.has(p.sku)) duplicateSkus.add(p.sku);
      seen.add(p.sku);
    }
  });

  const cleanedProducts = sourceItems.map((item) => {
    const res = runLocalCleanSingleProduct(item, duplicateSkus);
    return {
      _id: item._id,
      workspaceId,
      title: res.cleanedData.title,
      sku: res.cleanedData.sku,
      price: res.cleanedData.price,
      imageUrl: res.cleanedData.imageUrl,
      originalData: res.originalData,
      cleanedData: res.cleanedData,
      cleaningBadge: res.cleaningBadge,
      cleaningSummary: res.cleaningSummary,
    };
  });

  saveLocalCleanedList(workspaceId, cleanedProducts);
  const auditStats = computeAuditStats(workspaceId, cleanedProducts);
  saveLocalAudit(workspaceId, auditStats);

  return {
    message:
      "Data Health validation process complete. Database fully normalized.",
    auditStats,
  };
}

// =========================================================================
// 2. GET /api/v1/datacleaning/dashboard-metrics?workspaceId=...
// =========================================================================
export async function getHealthAuditMetricsApi({ workspaceId }, token) {
  if (!workspaceId) throw new Error("Workspace ID is missing.");

  if (!USE_MOCK_BACKEND) {
    const response = await fetch(
      `${API_BASE_URL}/datacleaning/dashboard-metrics?workspaceId=${encodeURIComponent(
        workspaceId
      )}`,
      {
        method: "GET",
        headers: buildHeaders(token),
        credentials: "include",
      }
    );
    return await handleApiResponse(response);
  }

  return (
    getLocalAudit(workspaceId) || {
      totalProducts: 0,
      missingValuesCount: 0,
      missingValuesPercent: 0,
      formattingNormalizedCount: 0,
      formattingNormalizedPercent: 0,
      skusReconciledCount: 0,
      skusReconciledPercent: 0,
    }
  );
}

// =========================================================================
// 3. GET /api/v1/datacleaning/list?workspaceId=...
// =========================================================================
export async function fetchInspectedProductsListApi(
  { workspaceId, status = "", search = "", page = 1, limit = 10 },
  token
) {
  if (!workspaceId) throw new Error("Workspace ID is missing.");

  if (!USE_MOCK_BACKEND) {
    const params = new URLSearchParams({
      workspaceId,
      page: String(page),
      limit: String(limit),
    });
    if (status) params.set("status", status);
    if (search.trim()) params.set("search", search.trim());

    const response = await fetch(
      `${API_BASE_URL}/datacleaning/list?${params.toString()}`,
      {
        method: "GET",
        headers: buildHeaders(token),
        credentials: "include",
      }
    );
    return await handleApiResponse(response);
  }

  let list = getLocalCleanedList(workspaceId);
  if (status) {
    list = list.filter((p) => p.cleaningBadge === status);
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        (p.originalData?.title || p.title || "").toLowerCase().includes(q) ||
        (p.cleanedData?.title || "").toLowerCase().includes(q) ||
        (p.originalData?.sku || p.sku || "").toLowerCase().includes(q) ||
        (p.cleanedData?.sku || "").toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    total,
    page: safePage,
    totalPages,
    products: list.slice(start, start + limit),
  };
}

// =========================================================================
// 4. GET /api/v1/datacleaning/compare/:productId
// =========================================================================
export async function compareProductDetailApi(
  { productId, workspaceId },
  token
) {
  if (!productId) throw new Error("Product ID is required.");

  if (!USE_MOCK_BACKEND) {
    const response = await fetch(
      `${API_BASE_URL}/datacleaning/compare/${encodeURIComponent(productId)}`,
      {
        method: "GET",
        headers: buildHeaders(token),
        credentials: "include",
      }
    );
    return await handleApiResponse(response);
  }

  const list = getLocalCleanedList(workspaceId);
  const product = list.find((p) => String(p._id) === String(productId));
  if (!product) {
    throw new Error("Inventory element mapping record not identified.");
  }

  return {
    id: product._id,
    badgeStatus: product.cleaningBadge,
    summary: product.cleaningSummary,
    rawView: product.originalData,
    cleanedView: product.cleanedData,
  };
}

// =========================================================================
// 5. PUT /api/v1/datacleaning/compare/:productId
// =========================================================================
export async function saveSingleCleanedProductApi(
  { productId, workspaceId, cleanedData },
  token
) {
  if (!productId) throw new Error("Product ID is required.");

  if (!USE_MOCK_BACKEND) {
    const response = await fetch(
      `${API_BASE_URL}/datacleaning/compare/${encodeURIComponent(productId)}`,
      {
        method: "PUT",
        headers: buildHeaders(token, true),
        credentials: "include",
        body: JSON.stringify({ cleanedData }),
      }
    );
    return await handleApiResponse(response);
  }

  const list = getLocalCleanedList(workspaceId);
  const idx = list.findIndex((p) => String(p._id) === String(productId));
  if (idx === -1) {
    throw new Error("Product mapping entry not found to modify.");
  }

  const updatedProduct = {
    ...list[idx],
    title: cleanedData.title ?? list[idx].title,
    sku: cleanedData.sku ?? list[idx].sku,
    price: cleanedData.price ?? list[idx].price,
    cleanedData: { ...list[idx].cleanedData, ...cleanedData },
    cleaningBadge: "Normalized",
    cleaningSummary: {
      ...list[idx].cleaningSummary,
      missingFields: [],
    },
  };

  const nextList = [...list];
  nextList[idx] = updatedProduct;
  saveLocalCleanedList(workspaceId, nextList);

  const auditStats = computeAuditStats(workspaceId, nextList);
  saveLocalAudit(workspaceId, auditStats);

  return {
    message: "Manually customized edit processed & audit log updated.",
    product: updatedProduct,
    auditStats,
  };
}