import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { AppShell, Skeleton, StepFooter } from "../components/layout/DashboardLayout.jsx";
import { useToast } from "../components/Toast.jsx";
import { apiService } from "../api/apiService.js";

export default function ReviewPage() {
  const [ready, setReady] = useState(null);
  const [attention, setAttention] = useState(null);
  const [active, setActive] = useState(null);
  const [value, setValue] = useState("");
  const [tab, setTab] = useState("attention");
  const toast = useToast();

  useEffect(() => {
    apiService.getReviewQueue().then((q) => {
      setReady(q.ready);
      setAttention(q.attention);
      setActive(q.attention[0] ?? null);
    });
  }, []);

  const save = () => {
    if (!active || !value.trim()) return;
    const next = attention.filter((p) => p.id !== active.id);
    setAttention(next);
    setActive(next[0] ?? null);
    setReady((r) => [...r, { id: active.id, title: active.title, sku: active.sku, image: active.image }]);
    setValue("");
    toast(`${active.title} is now Ready`, `${active.missingField} saved and validated.`);
  };

  const title = "Seller Review & Validation";
  const crumbs = ["Pipeline", "Step 7", "Review queue"];

  if (!ready || !attention) {
    return <AppShell title={title} breadcrumb={crumbs}><Skeleton height={384} /></AppShell>;
  }

  return (
    <AppShell title={title} breadcrumb={crumbs}>
      <div>
        <div className="tabs">
          <button className={tab === "ready" ? "on" : ""} onClick={() => setTab("ready")}>Ready ({ready.length})</button>
          <button className={tab === "attention" ? "on" : ""} onClick={() => setTab("attention")}>Attention Required ({attention.length})</button>
        </div>

        {tab === "ready" ? (
          <div className="card divided mt-4">
            {ready.map((p) => (
              <div key={p.id} className="list-row">
                <img src={p.image} alt={p.title} className="thumb" />
                <div className="flex-1">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="text-xs text-muted">{p.sku}</p>
                </div>
                <span className="badge badge-success"><CheckCircle2 size={12} /> Validated</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-5 mt-4">
            <div className="card divided span-3" style={{ alignSelf: "start" }}>
              {attention.length === 0 ? (
                <p className="empty">All products validated — nothing needs attention.</p>
              ) : (
                attention.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setActive(p); setValue(""); }}
                    className={`list-row ${active?.id === p.id ? "selected-warn" : ""}`}
                  >
                    <img src={p.image} alt={p.title} className="thumb" />
                    <div className="flex-1">
                      <p className="truncate font-medium">{p.title}</p>
                      <p className="text-xs text-muted">{p.sku} · missing {p.missingField}</p>
                    </div>
                    <span className="badge badge-warning"><AlertTriangle size={12} /> Attention</span>
                  </button>
                ))
              )}
            </div>
            <div className="card pad span-2" style={{ alignSelf: "start" }}>
              <p className="label-caps">Resolve listing requirement</p>
              {active ? (
                <div className="mt-4" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="notice">{active.message}</div>
                  <div className="field">
                    <label htmlFor="field">{active.missingField}</label>
                    <input id="field" className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder={`Enter ${active.missingField.toLowerCase()}…`} />
                  </div>
                  <div className="text-xs text-muted">
                    <p>Product: {active.title}</p>
                    <p>SKU: {active.sku}</p>
                  </div>
                  <button className="btn btn-primary btn-block" onClick={save} disabled={!value.trim()}>Save &amp; Validate</button>
                </div>
              ) : (
                <p className="mt-4 text-muted">Select a product from the queue to resolve its missing attribute.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <StepFooter to="/dashboard/publish" label="Continue to Publish" stepIndex={7} back={{ to: "/dashboard/mapping", label: "Back to mapping" }} />
    </AppShell>
  );
}
