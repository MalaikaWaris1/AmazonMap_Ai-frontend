import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import {
  AppShell,
  Skeleton,
  StepFooter,
} from "../components/layout/DashboardLayout.jsx";
import { useDataCleaning } from "../context/DataCleaningContext.jsx";
import "./CleanPage.css";

const BADGE_FILTERS = [
  { id: "", label: "All" },
  { id: "Missing Value Detected", label: "Missing Value" },
  { id: "Normalized", label: "Normalized" },
  { id: "Unchanged", label: "Unchanged" },
];

const BAR_PATTERNS = {
  missing: [42, 68, 28, 86, 54],
  normalized: [44, 66, 54, 88, 72],
  reconciled: [84, 88, 86, 94, 90],
};

export default function CleanPage() {
  const navigate = useNavigate();
  const {
    metrics,
    products,
    pagination,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    selectedProductId,
    comparison,
    analyzing,
    loadingList,
    loadingCompare,
    savingEdit,
    error,
    compareError,
    feedback,
    loadMetrics,
    loadProducts,
    loadComparison,
    runCleaningPipeline,
    saveManualEdits,
  } = useDataCleaning();

  const [viewMode, setViewMode] = useState("side-by-side");
  const [draft, setDraft] = useState({
    title: "",
    price: "",
    brand: "",
    sku: "",
    category: "",
    tags: "",
    weight: "",
    inventoryCount: "",
    description: "",
  });
  const [validationMsg, setValidationMsg] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const currentMetrics = await loadMetrics();
      if (!active) return;

      if (!currentMetrics || currentMetrics.totalProducts === 0) {
        await runCleaningPipeline();
      } else {
        await loadProducts({ status: "", search: "", page: 1 });
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setValidationMsg(null);
    if (!comparison?.cleanedView) return;
    const c = comparison.cleanedView;
    setDraft({
      title: c.title ?? "",
      price: c.price !== undefined && c.price !== null ? String(c.price) : "",
      brand: c.brand ?? "",
      sku: c.sku ?? "",
      category: c.category ?? "Uncategorized",
      tags: c.tags ?? "",
      weight: c.weight !== undefined && c.weight !== null ? String(c.weight) : "",
      inventoryCount:
        c.inventoryCount !== undefined && c.inventoryCount !== null
          ? String(c.inventoryCount)
          : "0",
      description: c.description ?? "",
    });
  }, [comparison]);

  const handleFilterClick = (nextStatus) => {
    setStatusFilter(nextStatus);
    loadProducts({ status: nextStatus, search: searchQuery, page: 1 });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    loadProducts({ status: statusFilter, search: val, page: 1 });
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    loadProducts({ status: statusFilter, search: searchQuery, page: nextPage });
  };

  const handleDraftChange = (field, value) => {
    setValidationMsg(null);
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndMarkClean = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const numericPrice = parseFloat(draft.price);
    if (!draft.title.trim()) {
      setValidationMsg("Product title cannot be empty.");
      return;
    }
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setValidationMsg("Please enter a valid price greater than 0.");
      return;
    }
    if (!draft.brand.trim() || draft.brand === "Standard Vendor/Generic") {
      setValidationMsg("Please enter a valid Brand name before marking clean.");
      return;
    }
    if (!draft.sku.trim()) {
      setValidationMsg("SKU is required.");
      return;
    }

    await saveManualEdits(selectedProductId, {
      title: draft.title.trim(),
      price: numericPrice,
      brand: draft.brand.trim(),
      sku: draft.sku.trim(),
      category: draft.category.trim() || "Uncategorized",
      tags: draft.tags.trim(),
      weight: draft.weight ? parseFloat(draft.weight) : null,
      inventoryCount: parseInt(draft.inventoryCount || "0", 10),
      description: draft.description.trim(),
    });
  };

  const handleNextProduct = () => {
    if (!products.length) return;
    const currentIndex = products.findIndex(
      (p) => String(p._id) === String(selectedProductId)
    );
    const nextIndex = (currentIndex + 1) % products.length;
    loadComparison(products[nextIndex]._id);
  };

  const getBadgeClass = (badge) => {
    if (badge === "Missing Value Detected") return "cln-pill cln-pill--warning";
    if (badge === "Normalized") return "cln-pill cln-pill--success";
    return "cln-pill cln-pill--neutral";
  };

  const raw = comparison?.rawView || {};
  const isBrandMissing =
    !draft.brand.trim() || draft.brand === "Standard Vendor/Generic";
  const isPriceMissing =
    Number.isNaN(parseFloat(draft.price)) || parseFloat(draft.price) <= 0;

  return (
    <AppShell
      title="Data Health & Cleaning"
      breadcrumb={["Pipeline", "Step 5", "Data cleaning"]}
    >
      <div className="cln">
        {/* Top Action Header */}
        <div className="cln-top-bar">
          <div>
            <p className="cln-eyebrow">Module 4 · Normalization &amp; Audit</p>
            <p className="cln-sub">
              Deep Shopify REST fields extracted, HTML tags stripped, SKUs reconciled, and missing values flagged.
            </p>
          </div>
          <button
            type="button"
            className="cln-btn-run"
            onClick={runCleaningPipeline}
            disabled={analyzing}
          >
            {analyzing ? (
              <Loader2 size={15} className="cln-spin" />
            ) : (
              <RefreshCw size={15} />
            )}
            <span>{analyzing ? "Analyzing Catalog..." : "Re-run Data Audit"}</span>
          </button>
        </div>

        {/* Success or Error Banners */}
        {feedback && (
          <div className="cln-banner cln-banner--success" role="status">
            <CheckCircle2 size={16} />
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className="cln-banner cln-banner--error" role="alert">
            <AlertTriangle size={16} />
            <span className="cln-banner-text">{error}</span>
            {error.toLowerCase().includes("no products") && (
              <button
                type="button"
                className="btn btn-outline cln-banner-btn"
                onClick={() => navigate("/import")}
              >
                <ShoppingBag size={14} /> Go to Shopify Import
              </button>
            )}
          </div>
        )}

        {/* 3 Top KPI Stat Cards */}
        <section className="cln-kpis" aria-label="Data health metrics">
          <div className="cln-card cln-kpi">
            <div className="cln-kpi-left">
              <span className="cln-caps">MISSING VALUES DETECTED</span>
              <strong className="cln-kpi-num">
                {metrics.missingValuesCount.toLocaleString()}
              </strong>
              <span className="cln-kpi-sub">
                {metrics.missingValuesPercent}% of catalog
              </span>
            </div>
            <div className="cln-mini-bars" aria-hidden="true">
              {BAR_PATTERNS.missing.map((h, idx) => (
                <span key={idx} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          <div className="cln-card cln-kpi">
            <div className="cln-kpi-left">
              <span className="cln-caps">FORMATTING NORMALIZED</span>
              <strong className="cln-kpi-num">
                {metrics.formattingNormalizedCount.toLocaleString()}
              </strong>
              <span className="cln-kpi-sub">
                {metrics.formattingNormalizedPercent}% of catalog
              </span>
            </div>
            <div className="cln-mini-bars" aria-hidden="true">
              {BAR_PATTERNS.normalized.map((h, idx) => (
                <span key={idx} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          <div className="cln-card cln-kpi">
            <div className="cln-kpi-left">
              <span className="cln-caps">SKUS RECONCILED</span>
              <strong className="cln-kpi-num">
                {metrics.skusReconciledCount.toLocaleString()}
              </strong>
              <span className="cln-kpi-sub">
                {metrics.skusReconciledPercent}% of catalog
              </span>
            </div>
            <div className="cln-mini-bars" aria-hidden="true">
              {BAR_PATTERNS.reconciled.map((h, idx) => (
                <span key={idx} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </section>

        {/* Main 2-Column Split View */}
        <section className="cln-workspace">
          {/* LEFT PANEL: CLEANING RESULTS */}
          <div className="cln-card cln-list-panel">
            <div className="cln-list-head">
              <div>
                <p className="cln-caps">CLEANING RESULTS</p>
                <p className="cln-sub">Select a product to inspect deep attributes</p>
              </div>
              <span className="cln-count-tag">{pagination.total} items</span>
            </div>

            <div className="cln-filter-bar">
              <div className="cln-filter-pills">
                {BADGE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`cln-filter-chip ${
                      statusFilter === f.id ? "is-active" : ""
                    }`}
                    onClick={() => handleFilterClick(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="cln-search">
                <Search size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Filter title or SKU..."
                />
              </div>
            </div>

            {loadingList || analyzing ? (
              <div className="cln-skel-stack">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} height={64} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="cln-empty">
                <Sparkles size={22} />
                <p>No products match the current filter.</p>
              </div>
            ) : (
              <div className="cln-product-list">
                {products.map((item) => {
                  const isSelected =
                    String(item._id) === String(selectedProductId);
                  const displayTitle =
                    item.cleanedData?.title ||
                    item.originalData?.title ||
                    item.title;
                  const displaySku =
                    item.cleanedData?.sku ||
                    item.originalData?.sku ||
                    item.sku;
                  const displayImg =
                    item.cleanedData?.imageUrl ||
                    item.originalData?.imageUrl ||
                    item.imageUrl;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      className={`cln-product-row ${
                        isSelected ? "is-selected" : ""
                      }`}
                      onClick={() => loadComparison(item._id)}
                    >
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={displayTitle}
                          className="cln-thumb"
                        />
                      ) : (
                        <div className="cln-thumb-placeholder">
                          {(displayTitle?.[0] || "P").toUpperCase()}
                        </div>
                      )}

                      <div className="cln-product-meta">
                        <strong className="truncate">{displayTitle}</strong>
                        <small>{displaySku}</small>
                      </div>

                      <span className={getBadgeClass(item.cleaningBadge)}>
                        {item.cleaningBadge || "Unchanged"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="cln-pagination">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: RAW VS CLEANED EDITOR (ALL DEEP ATTRIBUTES) */}
          <div className="cln-card cln-compare-panel">
            <div className="cln-tip-box">
              <Lightbulb size={16} className="cln-tip-icon" />
              <span>
                You can manually edit any field on the right to resolve warnings
                before sending to AI mapping.
              </span>
            </div>

            <div className="cln-compare-head">
              <span className="cln-caps">
                {viewMode === "side-by-side"
                  ? "RAW VS CLEANED (DEEP SHOPIFY FIELDS)"
                  : "CLEANED VALUES"}
              </span>

              <div className="cln-view-toggle" role="group">
                <button
                  type="button"
                  className={viewMode === "side-by-side" ? "is-on" : ""}
                  onClick={() => setViewMode("side-by-side")}
                >
                  Side by Side
                </button>
                <button
                  type="button"
                  className={viewMode === "cleaned-only" ? "is-on" : ""}
                  onClick={() => setViewMode("cleaned-only")}
                >
                  Cleaned Only
                </button>
              </div>
            </div>

            {compareError && (
              <div className="cln-inline-alert cln-inline-alert--error">
                <AlertTriangle size={14} />
                <span>{compareError}</span>
              </div>
            )}

            {validationMsg && (
              <div className="cln-inline-alert cln-inline-alert--warn">
                <AlertTriangle size={14} />
                <span>{validationMsg}</span>
              </div>
            )}

            {loadingCompare ? (
              <div className="cln-skel-stack">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} height={54} />
                ))}
              </div>
            ) : !comparison ? (
              <div className="cln-empty">
                <p>Select a product from the left list to inspect &amp; edit.</p>
              </div>
            ) : (
              <form
                onSubmit={handleSaveAndMarkClean}
                className="cln-compare-form"
              >
                <div className="cln-fields-scroll">
                  {/* 1. TITLE */}
                  <div className="cln-field-group">
                    <label className="cln-field-label">TITLE</label>
                    <div
                      className={`cln-field-pair ${
                        viewMode === "cleaned-only" ? "is-single" : ""
                      }`}
                    >
                      {viewMode === "side-by-side" && (
                        <div className="cln-raw-box">
                          {raw.title || <span className="cln-na">N/A</span>}
                        </div>
                      )}
                      <div className="cln-edit-box is-valid">
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) =>
                            handleDraftChange("title", e.target.value)
                          }
                          placeholder="Enter clean product title"
                        />
                        <Pencil size={13} className="cln-pencil" />
                      </div>
                    </div>
                  </div>

                  {/* 2. PRICE */}
                  <div className="cln-field-group">
                    <label className="cln-field-label">PRICE (USD)</label>
                    <div
                      className={`cln-field-pair ${
                        viewMode === "cleaned-only" ? "is-single" : ""
                      }`}
                    >
                      {viewMode === "side-by-side" && (
                        <div className="cln-raw-box">
                          {raw.price !== undefined
                            ? `${raw.price} usd`
                            : "N/A"}
                        </div>
                      )}
                      <div
                        className={`cln-edit-box ${
                          isPriceMissing ? "is-warn" : ""
                        }`}
                      >
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={draft.price}
                          onChange={(e) =>
                            handleDraftChange("price", e.target.value)
                          }
                          placeholder="0.00"
                        />
                        <Pencil size={13} className="cln-pencil" />
                      </div>
                    </div>
                    {isPriceMissing && (
                      <small className="cln-field-warn">
                        <AlertTriangle size={12} /> Price missing or zero —
                        enter a valid retail price
                      </small>
                    )}
                  </div>

                  {/* 3. BRAND / VENDOR (From rawShopifyData.vendor) */}
                  <div className="cln-field-group">
                    <label className="cln-field-label">BRAND (VENDOR)</label>
                    <div
                      className={`cln-field-pair ${
                        viewMode === "cleaned-only" ? "is-single" : ""
                      }`}
                    >
                      {viewMode === "side-by-side" && (
                        <div className="cln-raw-box">
                          {raw.brand ? (
                            raw.brand
                          ) : (
                            <span className="cln-na">N/A</span>
                          )}
                        </div>
                      )}
                      <div
                        className={`cln-edit-box ${
                          isBrandMissing ? "is-warn" : ""
                        }`}
                      >
                        <input
                          type="text"
                          value={draft.brand}
                          onChange={(e) =>
                            handleDraftChange("brand", e.target.value)
                          }
                          placeholder="Enter brand name"
                        />
                        <Pencil size={13} className="cln-pencil" />
                      </div>
                    </div>
                    {isBrandMissing && (
                      <small className="cln-field-warn">
                        <AlertTriangle size={12} /> Missing value - click to
                        add/correct brand
                      </small>
                    )}
                  </div>

                  {/* 4. SKU */}
                  <div className="cln-field-group">
                    <label className="cln-field-label">SKU</label>
                    <div
                      className={`cln-field-pair ${
                        viewMode === "cleaned-only" ? "is-single" : ""
                      }`}
                    >
                      {viewMode === "side-by-side" && (
                        <div className="cln-raw-box">
                          {raw.sku ? raw.sku : <span className="cln-na">N/A</span>}
                        </div>
                      )}
                      <div className="cln-edit-box">
                        <input
                          type="text"
                          value={draft.sku}
                          onChange={(e) =>
                            handleDraftChange("sku", e.target.value)
                          }
                          placeholder="SKU-0000"
                        />
                        <Pencil size={13} className="cln-pencil" />
                      </div>
                    </div>
                  </div>

                  {/* 5. CATEGORY (Deep product_type) */}
                  <div className="cln-field-group">
                    <label className="cln-field-label">CATEGORY</label>
                    <div
                      className={`cln-field-pair ${
                        viewMode === "cleaned-only" ? "is-single" : ""
                      }`}
                    >
                      {viewMode === "side-by-side" && (
                        <div className="cln-raw-box">
                          {raw.category || (
                            <span className="cln-na">Uncategorized</span>
                          )}
                        </div>
                      )}
                      <div className="cln-edit-box">
                        <input
                          type="text"
                          value={draft.category}
                          onChange={(e) =>
                            handleDraftChange("category", e.target.value)
                          }
                        />
                        <Pencil size={13} className="cln-pencil" />
                      </div>
                    </div>
                  </div>

                  {/* 6. WEIGHT & INVENTORY (Deep variant fields) */}
                  <div className="cln-field-group">
                    <label className="cln-field-label">
                      WEIGHT ({raw.weight_unit || "KG"}) &amp; INVENTORY
                    </label>
                    <div
                      className={`cln-field-pair ${
                        viewMode === "cleaned-only" ? "is-single" : ""
                      }`}
                    >
                      {viewMode === "side-by-side" && (
                        <div className="cln-raw-box">
                          {raw.weight ?? 0} {raw.weight_unit || "kg"} ·{" "}
                          {raw.inventoryCount ?? 0} in stock
                        </div>
                      )}
                      <div className="cln-edit-box">
                        <input
                          type="number"
                          step="0.01"
                          value={draft.weight}
                          onChange={(e) =>
                            handleDraftChange("weight", e.target.value)
                          }
                          placeholder="Weight"
                        />
                        <Pencil size={13} className="cln-pencil" />
                      </div>
                    </div>
                  </div>

                  {/* 7. TAGS (Deep tags field) */}
                  <div className="cln-field-group">
                    <label className="cln-field-label">TAGS</label>
                    <div
                      className={`cln-field-pair ${
                        viewMode === "cleaned-only" ? "is-single" : ""
                      }`}
                    >
                      {viewMode === "side-by-side" && (
                        <div className="cln-raw-box">
                          {raw.tags || <span className="cln-na">No tags</span>}
                        </div>
                      )}
                      <div className="cln-edit-box">
                        <input
                          type="text"
                          value={draft.tags}
                          onChange={(e) =>
                            handleDraftChange("tags", e.target.value)
                          }
                          placeholder="tag1, tag2"
                        />
                        <Pencil size={13} className="cln-pencil" />
                      </div>
                    </div>
                  </div>

                  {/* 8. DESCRIPTION (Raw HTML vs HTML Stripped) */}
                  <div className="cln-field-group">
                    <label className="cln-field-label">
                      DESCRIPTION (HTML STRIPPED &amp; SANITIZED)
                    </label>
                    <div
                      className={`cln-field-pair ${
                        viewMode === "cleaned-only" ? "is-single" : ""
                      }`}
                    >
                      {viewMode === "side-by-side" && (
                        <div className="cln-raw-box cln-raw-box--multi">
                          {raw.description || (
                            <span className="cln-na">No description</span>
                          )}
                        </div>
                      )}
                      <div className="cln-edit-box cln-edit-box--multi">
                        <textarea
                          rows={2}
                          value={draft.description}
                          onChange={(e) =>
                            handleDraftChange("description", e.target.value)
                          }
                          placeholder="Clean plain-text product description"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Bottom Save & Next Product Buttons */}
                <div className="cln-compare-actions">
                  <button
                    type="submit"
                    className="cln-btn-save"
                    disabled={savingEdit}
                  >
                    {savingEdit ? (
                      <Loader2 size={15} className="cln-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>
                      {savingEdit ? "Saving..." : "Save & Mark Clean"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="cln-btn-next"
                    onClick={handleNextProduct}
                    disabled={products.length <= 1}
                  >
                    <span>Next Product</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <StepFooter
          to="/dashboard/mapping"
          label="Continue to AI-Based Mapping"
          stepIndex={5}
          back={{ to: "/import", label: "Back to Shopify Import" }}
        />
      </div>
    </AppShell>
  );
}