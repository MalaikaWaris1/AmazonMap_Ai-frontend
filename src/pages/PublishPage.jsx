import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertOctagon, RotateCcw, Upload, Wand2 } from "lucide-react";
import { AppShell, Skeleton } from "../components/layout/DashboardLayout.jsx";
import { useToast } from "../components/Toast.jsx";
import { apiService } from "../api/apiService.js";
import { usePipeline } from "../context/PipelineContext.jsx";

export default function PublishPage() {
  const [data, setData] = useState(null);
  const [published, setPublished] = useState([]);
  const [askSeller, setAskSeller] = useState(null);
  const [answer, setAnswer] = useState("");
  const [tab, setTab] = useState("queue");
  const { unlock } = usePipeline();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    unlock(8);
    apiService.getPublishQueue().then(setData);
  }, [unlock]);

  const title = "Amazon Publish & Error Repair";
  const crumbs = ["Pipeline", "Step 8", "Publish"];

  if (!data) return <AppShell title={title} breadcrumb={crumbs}><Skeleton height={384} /></AppShell>;

  const done = data.summary.published + published.length;
  const pct = Math.min(100, Math.round((done / data.summary.total) * 100));

  const repair = (item, action) => {
    setData((d) => ({ ...d, errors: d.errors.filter((e) => e.id !== item.id) }));
    setAskSeller(null);
    setAnswer("");
    toast(`${action} applied to ${item.sku}`, "Listing re-submitted to Amazon SP-API.");
  };

  return (
    <AppShell title={title} breadcrumb={crumbs}>
      <div className="card pad">
        <div className="row-between" style={{ flexWrap: "wrap" }}>
          <div>
            <p className="label-caps">Pipeline completion</p>
            <p className="mt-1 text-muted">{done} of {data.summary.total} listings live on Amazon · {data.errors.length} in repair loop</p>
          </div>
          <span style={{ fontSize: 24, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div className="progress lg mt-4"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
      </div>

      <div>
        <div className="tabs">
          <button className={tab === "queue" ? "on" : ""} onClick={() => setTab("queue")}>Publish Queue ({data.queue.length})</button>
          <button className={tab === "errors" ? "on" : ""} onClick={() => setTab("errors")}>Error Repair Loop ({data.errors.length})</button>
        </div>

        {tab === "queue" ? (
          <div className="card divided mt-4">
            {data.queue.map((p) => (
              <div key={p.id} className="list-row">
                <img src={p.image} alt={p.title} className="thumb" />
                <div className="flex-1">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="text-xs text-muted">{p.sku}</p>
                </div>
                {published.includes(p.id) ? (
                  <span className="badge badge-success">Published</span>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      await apiService.publishProduct(p.id);
                      setPublished((s) => [...s, p.id]);
                      toast(`${p.sku} published to Amazon`);
                    }}
                  >
                    <Upload size={14} /> Publish to Amazon
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {data.errors.length === 0 ? (
              <div className="card empty">No rejected listings — the repair loop is clear.</div>
            ) : (
              data.errors.map((e) => (
                <div key={e.id} className="card pad">
                  <div className="row" style={{ flexWrap: "wrap" }}>
                    <img src={e.image} alt={e.title} className="thumb" />
                    <div className="flex-1">
                      <p className="truncate font-medium">{e.title}</p>
                      <p className="text-xs text-muted">{e.sku}</p>
                    </div>
                    <span className="badge badge-danger"><AlertOctagon size={12} /> {e.code}: {e.message}</span>
                  </div>
                  <div className="row mt-4" style={{ gap: 8, flexWrap: "wrap" }}>
                    <button className="btn btn-primary btn-sm" onClick={() => repair(e, "Auto-Correct")}><Wand2 size={14} /> Auto-Correct</button>
                    <button className="btn btn-outline btn-sm" onClick={() => repair(e, "Re-derive from Shopify")}><RotateCcw size={14} /> Re-derive from Shopify</button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setAskSeller(e); setAnswer(""); }}>Ask Seller</button>
                  </div>
                  {askSeller?.id === e.id && (
                    <div className="ask-box">
                      <div className="field">
                        <label htmlFor={`ask-${e.id}`}>{e.message}</label>
                        <input id={`ask-${e.id}`} className="input" value={answer} onChange={(ev) => setAnswer(ev.target.value)} placeholder="Enter the required value…" />
                      </div>
                      <div>
                        <button className="btn btn-primary btn-sm" disabled={!answer.trim()} onClick={() => repair(e, "Seller input")}>Save &amp; Validate</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="step-footer">
        <button className="btn btn-outline" onClick={() => navigate("/dashboard/review")}>Back to review</button>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>Return to Command Center</button>
      </div>
    </AppShell>
  );
}
