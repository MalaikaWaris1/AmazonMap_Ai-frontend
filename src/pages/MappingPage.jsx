import { useEffect, useState } from "react";
import { ArrowRight, CheckCheck, Sparkles } from "lucide-react";
import { AppShell, Skeleton, StepFooter } from "../components/layout/DashboardLayout.jsx";
import { useToast } from "../components/Toast.jsx";
import { apiService } from "../api/apiService.js";

export default function MappingPage() {
  const [mappings, setMappings] = useState(null);
  const [selected, setSelected] = useState("");
  const [approved, setApproved] = useState([]);
  const toast = useToast();

  useEffect(() => {
    apiService.getMappings().then((m) => {
      setMappings(m);
      setSelected(m[0].productId);
    });
  }, []);

  const current = mappings?.find((m) => m.productId === selected);

  return (
    <AppShell title="AI + Rule Mapping Engine" breadcrumb={["Pipeline", "Step 6", "Field mapping"]}>
      <div className="card pad row" style={{ flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="label-caps">Product</p>
          <div className="mt-2" style={{ width: 288 }}>
            {mappings ? (
              <select className="select" value={selected} onChange={(e) => setSelected(e.target.value)}>
                {mappings.map((m) => <option key={m.productId} value={m.productId}>{m.title}</option>)}
              </select>
            ) : (
              <Skeleton height={38} />
            )}
          </div>
        </div>
        <div className="ml-auto row">
          <span className="badge badge-ai"><Sparkles size={12} /> AI Mapped (Qwen)</span>
          <span className="badge badge-rule">Rule Engine</span>
          <button
            className="btn btn-primary"
            onClick={() => {
              setApproved(mappings?.map((m) => m.productId) ?? []);
              toast("All mappings approved", `${mappings?.length ?? 0} products marked ready for review.`);
            }}
          >
            <CheckCheck size={16} /> Approve All Mappings
          </button>
        </div>
      </div>

      {current ? (
        <div className="grid grid-2">
          <div className="card pad">
            <p className="label-caps">Cleaned Shopify data</p>
            <div className="mt-4 stack-sm">
              {current.shopify.map((f) => (
                <div key={f.field} className="boxed row-between">
                  <span className="font-mono text-xs text-muted">{f.field}</span>
                  <span className="truncate" style={{ maxWidth: "60%" }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card pad">
            <div className="row" style={{ gap: 8 }}>
              <p className="label-caps">Proposed Amazon listing</p>
              <ArrowRight size={14} className="text-muted" />
            </div>
            <div className="mt-4 stack-sm">
              {current.amazon.map((f) => (
                <div key={f.field} className="boxed">
                  <div className="row-between">
                    <span className="font-mono text-xs text-muted">{f.field}</span>
                    <span className="truncate" style={{ maxWidth: "60%" }}>{f.value}</span>
                  </div>
                  <div className="row mt-2" style={{ gap: 8 }}>
                    {f.source === "AI" ? (
                      <>
                        <span className="badge badge-ai">AI Mapped (Qwen)</span>
                        <span className="text-xs text-muted">{f.confidence}% confidence</span>
                      </>
                    ) : (
                      <span className="badge badge-rule">Rule Engine</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {approved.includes(current.productId) && <p className="mt-4 font-medium text-success">Mapping approved</p>}
          </div>
        </div>
      ) : (
        <div className="grid grid-2">
          <Skeleton height={384} />
          <Skeleton height={384} />
        </div>
      )}

      <StepFooter to="/dashboard/review" label="Continue to Review" stepIndex={6} back={{ to: "/dashboard/clean", label: "Back to cleaning" }} />
    </AppShell>
  );
}
