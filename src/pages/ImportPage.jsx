import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Loader2, RefreshCw, Search, Store } from "lucide-react";
import { AppShell, Skeleton, StepFooter } from "../components/layout/DashboardLayout.jsx";
import { apiService } from "../api/apiService.js";
import "./importPage.css";

const STAGES = ["Fetching products from Shopify", "Cleaning product data", "Saving to catalog"];
const SCOPES = [
  { id: "all", label: "Entire catalog", hint: "Every product in your store" },
  { id: "new", label: "New products only", hint: "Added since the last import" },
  { id: "changed", label: "Changed products only", hint: "Edited since the last import" },
];

export default function ImportPage() {
  const [conn, setConn] = useState(null);
  const [rows, setRows] = useState(null);
  const [scope, setScope] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  const load = async () => {
    setRows(null);
    setError(null);
    try {
      const [c, p] = await Promise.all([apiService.getShopifyConnection(), apiService.getShopifyImportPreview()]);
      setConn(c);
      setRows(p);
      setSelected(new Set(p.map((r) => r.id)));
    } catch {
      setError("Could not load products from Shopify. Please try again.");
    }
  };

  useEffect(() => {
    load();
    return () => timer.current && clearInterval(timer.current);
  }, []);

  const visible = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) => (scope === "all" || r.importType === scope) &&
        (!q || r.title.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q))
    );
  }, [rows, scope, query]);

  const chosen = visible.filter((r) => selected.has(r.id));
  const allChecked = visible.length > 0 && chosen.length === visible.length;

  const changeScope = (s) => {
    setScope(s);
    if (rows) setSelected(new Set(rows.filter((r) => s === "all" || r.importType === s).map((r) => r.id)));
  };

  const toggle = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = () =>
    setSelected((prev) => {
      const n = new Set(prev);
      visible.forEach((r) => (allChecked ? n.delete(r.id) : n.add(r.id)));
      return n;
    });

  const startImport = async () => {
    if (importing || chosen.length === 0) return;
    setImporting(true);
    setResult(null);
    setError(null);
    setProgress(0);
    timer.current = setInterval(() => setProgress((p) => Math.min(p + 4, 95)), 100);
    try {
      const r = await apiService.importShopifyProducts(chosen.map((c) => c.id));
      setProgress(100);
      setResult(r);
    } catch {
      setError("The import failed. No products were changed. Please try again.");
    } finally {
      clearInterval(timer.current);
      setImporting(false);
    }
  };

  const stageIndex = progress >= 100 ? 3 : Math.min(2, Math.floor(progress / 34));
  const counts = result ?? { fetched: 0, created: 0, updated: 0, warnings: 0 };

  return (
    <AppShell title="Shopify Integration & Import" breadcrumb={["Pipeline", "Step 4", "Shopify import"]}>
      <div className="imp">
        <div className="imp-top">
          <div className="imp-card imp-conn">
            <div className="imp-logo">
              <img src="/shopify-logo.png" alt="Shopify" onError={(e) => (e.currentTarget.style.display = "none")} />
              <Store size={22} />
            </div>
            {conn ? (
              <div className="imp-conn-text">
                <div className="imp-row">
                  <strong>{conn.store}</strong>
                  <span className="pill pill-success"><CheckCircle2 size={12} /> Healthy</span>
                </div>
                <p className="muted">{conn.plan} · Last synced {conn.lastSynced}</p>
              </div>
            ) : (
              <Skeleton className="imp-skel" />
            )}
            <button className="btn btn-outline" onClick={load} disabled={importing}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          <div className="imp-card">
            <p className="caps">Import scope</p>
            {SCOPES.map((s) => (
              <label key={s.id} className="imp-radio">
                <input type="radio" name="scope" checked={scope === s.id} onChange={() => changeScope(s.id)} disabled={importing} />
                <span><b>{s.label}</b><small>{s.hint}</small></span>
              </label>
            ))}
          </div>
        </div>

        <div className="imp-stats">
          {[["Fetched", counts.fetched, ""], ["Created", counts.created, "t-success"], ["Updated", counts.updated, "t-primary"], ["Warnings", counts.warnings, "t-warning"]].map(([l, v, t]) => (
            <div key={l} className="imp-card">
              <p className="caps">{l}</p>
              <p className={`imp-num ${t}`}>{v}</p>
              <small className="muted">{result ? "Last import" : "No import yet"}</small>
            </div>
          ))}
        </div>

        {(importing || result) && (
          <div className="imp-card">
            <div className="imp-row imp-between">
              <span className="imp-row">
                {importing ? <Loader2 size={16} className="spin t-primary" /> : <CheckCircle2 size={16} className="t-success" />}
                <b>{importing ? STAGES[stageIndex] : `Import complete — ${counts.fetched} products imported`}</b>
              </span>
              <span className="muted">{progress}%</span>
            </div>
            <div className="imp-bar"><div style={{ width: `${progress}%` }} /></div>
            <div className="imp-stages">
              {STAGES.map((s, i) => (
                <span key={s} className={i < stageIndex ? "t-success" : ""}>{i < stageIndex ? "✓ " : `${i + 1}. `}{s}</span>
              ))}
            </div>
            {result?.warnings > 0 && (
              <p className="imp-row t-warning"><AlertTriangle size={16} /> {result.warnings} products have missing values — they will be fixed in Data Cleaning.</p>
            )}
          </div>
        )}

        {error && <div className="imp-card imp-error"><AlertTriangle size={16} /> {error}</div>}

       

        <div className="imp-card imp-table-card">
          <div className="imp-toolbar">
            <div className="imp-grow">
              <p className="caps">Shopify products</p>
              <p className="muted">{chosen.length} of {visible.length} selected</p>
            </div>
            <div className="imp-search">
              <Search size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or SKU" />
            </div>
            <button className="btn btn-primary" onClick={startImport} disabled={importing || chosen.length === 0}>
              {importing ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
              {importing ? "Importing…" : `Start import (${chosen.length})`}
            </button>
          </div>

          {!rows ? (
            <div className="imp-pad">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="imp-skel-row" />)}</div>
          ) : visible.length === 0 ? (
            <p className="imp-empty">No products match this filter.</p>
          ) : (
            <div className="imp-scroll">
              <table className="imp-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" aria-label="Select all" checked={allChecked} onChange={toggleAll} disabled={importing} /></th>
                    {["Product", "SKU", "Category", "Inventory", "Price", "Change", "Status"].map((h) => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <tr key={p.id}>
                      <td><input type="checkbox" aria-label={`Select ${p.title}`} checked={selected.has(p.id)} onChange={() => toggle(p.id)} disabled={importing} /></td>
                      <td><div className="imp-row"><img src={p.image} alt={p.title} className="imp-thumb" /><b>{p.title}</b></div></td>
                      <td className="muted">{p.sku}</td>
                      <td className="muted">{p.category}</td>
                      <td className="muted">{p.inventory}</td>
                      <td>${p.price.toFixed(2)}</td>
                      <td className="muted cap">{p.importType}</td>
                      <td>{result && selected.has(p.id) ? <span className="pill pill-success">Imported</span> : <span className="pill">Ready</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
 {/* NEW — Imported products list, shown after a successful import */}
        {result && (
          <div className="imp-card imp-imported">
            <div className="imp-toolbar">
              <div className="imp-grow">
                <p className="caps">Imported products</p>
                <p className="muted">{chosen.length} products added to your catalog — continue to Data Cleaning to fix missing values.</p>
              </div>
              <span className="pill pill-success"><CheckCircle2 size={12} /> {chosen.length} imported</span>
            </div>
            <div className="imp-imported-list">
              {chosen.map((p) => (
                <div key={p.id} className="imp-imported-row">
                  <img src={p.image} alt={p.title} className="imp-thumb" />
                  <div className="imp-imported-text">
                    <b>{p.title}</b>
                    <small className="muted">{p.sku} · {p.category}</small>
                  </div>
                  <span className="pill pill-success">Imported</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <StepFooter to="/dashboard/clean" label="Continue to Data Cleaning" stepIndex={4} back={{ to: "/dashboard", label: "Back to dashboard" }} />
      </div>
    </AppShell>
  );
}
