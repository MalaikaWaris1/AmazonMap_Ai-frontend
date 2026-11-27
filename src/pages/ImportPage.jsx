import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Search,
  Store,
} from "lucide-react";
import {
  AppShell,
  Skeleton,
  StepFooter,
} from "../components/layout/DashboardLayout.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import { useImport } from "../context/ImportContext.jsx";
import { getConnectedShopifyStore } from "../api/shopifyService.js";
import "./importPage.css";

const STAGES = [
  "Fetching deep REST product data",
  "Validating SKUs & pricing",
  "Saving rawShopifyData to catalog",
];

const SCOPES = [
  { id: "all", label: "Entire catalog", hint: "Every product in your store" },
  { id: "new", label: "New products only", hint: "Added since the last import" },
  { id: "changed", label: "Changed products only", hint: "Edited since the last import" },
];

export default function ImportPage() {
  const { activeWorkspace } = useWorkspace();
  const {
    catalogProducts,
    importedProducts,
    lastImportStats,
    loadingCatalog,
    importing,
    importError,
    loadShopifyCatalog,
    runProductImport,
  } = useImport();

  const [scope, setScope] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [justImportedIds, setJustImportedIds] = useState(new Set());
  const timerRef = useRef(null);

  const connectedStore = getConnectedShopifyStore(activeWorkspace?._id);

  // Initial fetch on mount or workspace switch
  useEffect(() => {
    let active = true;
    loadShopifyCatalog(50).then((items) => {
      if (active && items.length > 0) {
        setSelectedIds(new Set(items.map((p) => p.shopifyProductId)));
      }
    });
    return () => {
      active = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadShopifyCatalog]);

  const handleRefresh = async () => {
    const items = await loadShopifyCatalog(50);
    setSelectedIds(new Set(items.map((p) => p.shopifyProductId)));
  };

  // Filter visible rows by scope & search query
  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalogProducts.filter(
      (item) =>
        (scope === "all" || item.importType === scope) &&
        (!q ||
          item.title.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q))
    );
  }, [catalogProducts, scope, query]);

  const chosenProducts = useMemo(
    () => visibleRows.filter((item) => selectedIds.has(item.shopifyProductId)),
    [visibleRows, selectedIds]
  );

  const allChecked =
    visibleRows.length > 0 && chosenProducts.length === visibleRows.length;

  const handleScopeChange = (nextScope) => {
    setScope(nextScope);
    const matching = catalogProducts.filter(
      (item) => nextScope === "all" || item.importType === nextScope
    );
    setSelectedIds(new Set(matching.map((item) => item.shopifyProductId)));
  };

  const toggleRow = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleAllRows = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      visibleRows.forEach((item) => {
        if (allChecked) next.delete(item.shopifyProductId);
        else next.add(item.shopifyProductId);
      });
      return next;
    });
  };

  const handleStartImport = async () => {
    if (importing || chosenProducts.length === 0) return;

    setProgress(10);
    timerRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 92));
    }, 150);

    try {
      await runProductImport(chosenProducts);
      setProgress(100);
      setJustImportedIds(
        new Set(chosenProducts.map((p) => p.shopifyProductId))
      );
    } catch {
      setProgress(0);
    } finally {
      clearInterval(timerRef.current);
    }
  };

  const stageIndex = progress >= 100 ? 3 : Math.min(2, Math.floor(progress / 34));
  const counts = lastImportStats ?? {
    fetched: 0,
    created: 0,
    updated: 0,
    warnings: 0,
  };

  return (
    <AppShell
      title="Shopify Product Import"
      breadcrumb={["Pipeline", "Step 4", "Shopify import"]}
    >
      <div className="imp">
        {/* Top Connection + Import Scope */}
        <div className="imp-top">
          <div className="imp-card imp-conn">
            <div className="imp-logo">
              <Store size={22} />
            </div>
            <div className="imp-conn-text">
              <div className="imp-row">
                <strong>
                  {connectedStore?.shopDomain || "northwind-supply.myshopify.com"}
                </strong>
                <span className="pill pill-success">
                  <CheckCircle2 size={12} /> Connected
                </span>
              </div>
              <p className="muted">
                Workspace: {activeWorkspace?.name || "My Shopify Store"} · Admin GraphQL + REST API
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleRefresh}
              disabled={importing || loadingCatalog}
            >
              <RefreshCw size={15} className={loadingCatalog ? "spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="imp-card">
            <p className="caps">Import scope</p>
            {SCOPES.map((s) => (
              <label key={s.id} className="imp-radio">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === s.id}
                  onChange={() => handleScopeChange(s.id)}
                  disabled={importing}
                />
                <span>
                  <b>{s.label}</b>
                  <small>{s.hint}</small>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ImportLog Stats Cards */}
        <div className="imp-stats">
          {[
            ["Fetched", counts.fetched, ""],
            ["Created", counts.created, "t-success"],
            ["Updated", counts.updated, "t-primary"],
            ["Warnings", counts.warnings, "t-warning"],
          ].map(([label, val, tone]) => (
            <div key={label} className="imp-card">
              <p className="caps">{label}</p>
              <p className={`imp-num ${tone}`}>{val}</p>
              <small className="muted">
                {lastImportStats ? "Latest ImportLog" : "No import yet"}
              </small>
            </div>
          ))}
        </div>

        {/* Live Progress & Warning Banner */}
        {(importing || lastImportStats) && (
          <div className="imp-card">
            <div className="imp-row imp-between">
              <span className="imp-row">
                {importing ? (
                  <Loader2 size={16} className="spin t-primary" />
                ) : (
                  <CheckCircle2 size={16} className="t-success" />
                )}
                <b>
                  {importing
                    ? STAGES[stageIndex]
                    : `Import complete — ${counts.fetched} products saved to catalog`}
                </b>
              </span>
              <span className="muted">{importing ? `${progress}%` : "100%"}</span>
            </div>

            <div className="imp-bar">
              <div style={{ width: `${importing ? progress : 100}%` }} />
            </div>

            <div className="imp-stages">
              {STAGES.map((stageLabel, i) => {
                const done = !importing || i < stageIndex;
                return (
                  <span key={stageLabel} className={done ? "t-success" : ""}>
                    {done ? "✓ " : `${i + 1}. `}
                    {stageLabel}
                  </span>
                );
              })}
            </div>

            {counts.warnings > 0 && (
              <p className="imp-row t-warning" style={{ marginTop: 6 }}>
                <AlertTriangle size={15} />
                <span>
                  {counts.warnings} product(s) have missing SKU or zero price —
                  flagged for Data Cleaning &amp; Audit.
                </span>
              </p>
            )}
          </div>
        )}

        {importError && (
          <div className="imp-card imp-error">
            <AlertTriangle size={16} />
            <span>{importError}</span>
          </div>
        )}

        {/* Shopify Product Selection Table */}
        <div className="imp-card imp-table-card">
          <div className="imp-toolbar">
            <div className="imp-grow">
              <p className="caps">Shopify store products</p>
              <p className="muted">
                {chosenProducts.length} of {visibleRows.length} selected
              </p>
            </div>
            <div className="imp-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title or SKU..."
              />
            </div>
            <button
              type="button"
              className="btn btn-shopify-primary"
              onClick={handleStartImport}
              disabled={importing || loadingCatalog || chosenProducts.length === 0}
            >
              {importing ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <Download size={16} />
              )}
              <span>
                {importing
                  ? "Importing..."
                  : `Start import (${chosenProducts.length})`}
              </span>
            </button>
          </div>

          {loadingCatalog ? (
            <div className="imp-pad">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="imp-skel-row" />
              ))}
            </div>
          ) : visibleRows.length === 0 ? (
            <p className="imp-empty">No products match this filter.</p>
          ) : (
            <div className="imp-scroll">
              <table className="imp-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        checked={allChecked}
                        onChange={toggleAllRows}
                        disabled={importing}
                      />
                    </th>
                    {[
                      "Product",
                      "SKU",
                      "Category",
                      "Inventory",
                      "Price",
                      "Change",
                      "Status",
                    ].map((heading) => (
                      <th key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((p) => {
                    const hasWarning =
                      !p.sku || p.sku === "N/A" || Number(p.price) <= 0;
                    const isImportedNow = justImportedIds.has(
                      p.shopifyProductId
                    );

                    return (
                      <tr key={p.shopifyProductId}>
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select ${p.title}`}
                            checked={selectedIds.has(p.shopifyProductId)}
                            onChange={() => toggleRow(p.shopifyProductId)}
                            disabled={importing}
                          />
                        </td>
                        <td>
                          <div className="imp-row">
                            {p.imageUrl && (
                              <img
                                src={p.imageUrl}
                                alt={p.title}
                                className="imp-thumb"
                              />
                            )}
                            <b>{p.title}</b>
                          </div>
                        </td>
                        <td className={p.sku === "N/A" ? "t-warning" : "muted"}>
                          {p.sku}
                        </td>
                        <td className="muted">{p.category}</td>
                        <td className="muted">{p.inventory}</td>
                        <td className={p.price <= 0 ? "t-warning" : ""}>
                          ${Number(p.price).toFixed(2)}
                        </td>
                        <td className="muted cap">{p.importType}</td>
                        <td>
                          {isImportedNow ? (
                            <span className="pill pill-success">Imported</span>
                          ) : hasWarning ? (
                            <span className="pill pill-warning">Warning</span>
                          ) : (
                            <span className="pill">Ready</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Saved Catalog Summary Card */}
        {importedProducts.length > 0 && (
          <div className="imp-card imp-imported">
            <div className="imp-toolbar">
              <div className="imp-grow">
                <p className="caps">Catalog database (rawShopifyData saved)</p>
                <p className="muted">
                  {importedProducts.length} product(s) ready for Data Cleaning &amp; Audit.
                </p>
              </div>
              <span className="pill pill-success">
                <CheckCircle2 size={12} /> {importedProducts.length} in catalog
              </span>
            </div>
            <div className="imp-imported-list">
              {importedProducts.map((p) => (
                <div key={p.shopifyProductId} className="imp-imported-row">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="imp-thumb"
                    />
                  )}
                  <div className="imp-imported-text">
                    <b>{p.title}</b>
                    <small className="muted">
                      {p.sku} · {p.category} · ${Number(p.price).toFixed(2)}
                    </small>
                  </div>
                  <span className="pill pill-success">Saved</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <StepFooter
          to="/dashboard/clean"
          label="Continue to Data Cleaning & Audit"
          stepIndex={4}
          back={{ to: "/dashboard", label: "Back to dashboard" }}
        />
      </div>
    </AppShell>
  );
}