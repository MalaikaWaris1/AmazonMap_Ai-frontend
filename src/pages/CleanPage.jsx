import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer } from "recharts";
import { AppShell, Skeleton, StepFooter } from "../components/layout/DashboardLayout.jsx";
import { apiService, PRODUCTS } from "../api/apiService.js";


const tagClass = (status) =>
  status === "Normalized" ? "badge badge-success" : status === "Missing Value Detected" ? "badge badge-warning" : "badge";

export default function CleanPage() {
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(PRODUCTS[0].id);
  const [view, setView] = useState("compare");
  const [compare, setCompare] = useState(null);

  useEffect(() => {
    apiService.getCleaningStats().then(setStats);
  }, []);

  useEffect(() => {
    setCompare(null);
    apiService.getCleaningComparison(selected).then(setCompare);
  }, [selected]);

  return (
    <AppShell title="Data Health & Cleaning" breadcrumb={["Pipeline", "Step 5", "Data cleaning"]}>
      <div className="grid grid-3">
        {stats
          ? stats.map((s) => (
              <div key={s.label} className="card pad">
                <p className="label-caps">{s.label}</p>
                <div className="row-between mt-3" style={{ alignItems: "flex-end" }}>
                  <div>
                    <p className="metric">{s.count.toLocaleString()}</p>
                    <p className="text-xs text-muted">{s.pct}% of catalog</p>
                  </div>
                  <div style={{ width: 96, height: 48 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={s.bars.map((v, idx) => ({ v, idx }))}>
                        <Bar dataKey="v" fill="#2a5aa8" radius={3} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ))
          : [0, 1, 2].map((i) => <Skeleton key={i} height={136} />)}
      </div>

      <div className="grid grid-5">
        <div className="card clip span-3">
          <div className="card-head">
            <p className="label-caps">Cleaning results</p>
            <p className="mt-1 text-muted">Select a product to compare data</p>
          </div>
          <div className="scroll-list divided">
            {PRODUCTS.map((p) => (
              <button key={p.id} onClick={() => setSelected(p.id)} className={`list-row ${selected === p.id ? "selected" : ""}`}>
                <img src={p.image} alt={p.title} className="thumb" />
                <div className="flex-1">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="text-xs text-muted">{p.sku}</p>
                </div>
                <span className={tagClass(p.status)}>{p.status === "Raw" ? "Unchanged" : p.status}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card span-2">
          <div className="card-head row-between">
            <p className="label-caps">Raw vs cleaned</p>
            <div className="segmented">
              {["compare", "cleaned"].map((v) => (
                <button key={v} className={view === v ? "on" : ""} onClick={() => setView(v)}>
                  {v === "compare" ? "Side by side" : "Cleaned only"}
                </button>
              ))}
            </div>
          </div>
          <div className="stack" style={{ padding: 20 }}>
            {compare
              ? compare.cleaned.map((c, i) => (
                  <div key={c.field} className="boxed">
                    <p className="label-caps">{c.field}</p>
                    <div className={`compare ${view === "compare" ? "" : "single"}`}>
                      {view === "compare" && <div className="val val-raw">{compare.raw[i].value}</div>}
                      <div className={`val ${c.value === "Missing" ? "val-missing" : "val-ok"}`}>{c.value}</div>
                    </div>
                  </div>
                ))
              : [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={64} />)}
          </div>
        </div>
      </div>

      <StepFooter to="/dashboard/mapping" label="Continue to AI Mapping" stepIndex={5} back={{ to: "/dashboard/import", label: "Back to import" }} />
    </AppShell>
  );
}
