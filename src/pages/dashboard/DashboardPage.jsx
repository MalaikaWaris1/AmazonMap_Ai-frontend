import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Store,
  Package,
  CheckCircle2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AppShell,
  Skeleton,
  StepFooter,
} from "../../components/layout/DashboardLayout.jsx";
import { apiService } from "../../api/apiService.js";
import { usePipeline } from "../../context/PipelineContext.jsx";
import "./DashboardPage.css";

const colors = {
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
};

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
  fontSize: 12,
};

export default function DashboardPage() {
  const [range, setRange] = useState("weekly");
  const [insights, setInsights] = useState(null);
  const [activity, setActivity] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState(null);
  const [accountsError, setAccountsError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const navigate = useNavigate();
  const { unlocked, unlock } = usePipeline();

  useEffect(() => {
    let active = true;

    setInsights(null);
    setActivity(null);
    setConnectedAccounts(null);
    setAccountsError(false);

    apiService.getDashboardInsights(range).then((data) => {
      if (active) setInsights(data);
    });

    apiService.getActivity().then((data) => {
      if (active) setActivity(data);
    });

    apiService
      .getSettings()
      .then(({ accounts }) => {
        if (!active) return;

        setConnectedAccounts(
          accounts.filter((account) => {
            const name = account.name.toLowerCase();
            return (
              account.connected &&
              (name.includes("shopify") || name.includes("amazon"))
            );
          })
        );
      })
      .catch(() => {
        if (active) setAccountsError(true);
      });

    return () => {
      active = false;
    };
  }, [range, refresh]);

  const openStage = (path) => {
    const step =
      ["/import", "/clean", "/mapping", "/review", "/publish"].indexOf(path) + 3;

    if (step > 0) {
      if (step > unlocked) unlock(step);
      navigate(path);
    }
  };

  return (
    <AppShell
      title="Command Center"
      breadcrumb={["Pipeline", "Step 3", "Dashboard overview"]}
    >
      <div className="dash-heading">
        <div>
          <p className="label-caps">Operations overview</p>
          <h2>Shopify → Amazon at a glance</h2>
          <p className="text-muted">
            Your catalog, from import through live listings.
          </p>
        </div>
        <button
          className="btn btn-outline dash-icon-btn"
          aria-label="Refresh dashboard"
          title="Refresh dashboard"
          onClick={() => setRefresh((n) => n + 1)}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="dash-toolbar">
        <span className="text-muted">
          <i className="dash-live" /> Demo data ·{" "}
          {range === "weekly" ? "Last 7 days" : "Last 4 weeks"}
        </span>
        <div
          className="segmented"
          role="group"
          aria-label="Reporting period"
        >
          {["weekly", "monthly"].map((period) => (
            <button
              key={period}
              className={range === period ? "on" : ""}
              aria-pressed={range === period}
              onClick={() => setRange(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <section className="dash-metrics" aria-label="Key metrics">
        {insights
          ? insights.summary.map((metric) => (
              <div className="card pad dash-metric" key={metric.label}>
                <div className="dash-row">
                  <p className="label-caps">{metric.label}</p>
                  <span className={`dash-tone dash-${metric.tone}`}>
                    {metric.direction === "up" ? (
                      <ArrowUpRight size={17} />
                    ) : (
                      <ArrowDownRight size={17} />
                    )}
                  </span>
                </div>
                <strong>{metric.value}</strong>
                <p className="text-xs text-muted">
                  <span
                    className={
                      metric.tone === "destructive"
                        ? "text-danger"
                        : "text-success"
                    }
                  >
                    {metric.change}
                  </span>{" "}
                  vs previous {range === "weekly" ? "week" : "month"}
                </p>
              </div>
            ))
          : [0, 1, 2, 3].map((i) => <Skeleton key={i} height={144} />)}
      </section>

      <section className="dash-chart-grid" aria-label="Performance charts">
        <div className="card pad dash-chart">
          <p className="label-caps">Pipeline throughput</p>
          <h3>Import to publication</h3>
          <p className="text-muted">
            Products processed {range === "weekly" ? "each day" : "each week"}
          </p>
          <div className="dash-plot">
            {insights ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={insights.throughput}
                  margin={{ left: -25, right: 5, top: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="dashboard-import"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={0.22}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeDasharray="3 4"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="imported"
                    name="Imported"
                    stroke="var(--primary)"
                    fill="url(#dashboard-import)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="cleaned"
                    name="Cleaned"
                    stroke="var(--warning)"
                    fill="transparent"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="published"
                    name="Published"
                    stroke="var(--success)"
                    fill="transparent"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton height="100%" />
            )}
          </div>
        </div>

        <div className="card pad dash-health">
          <p className="label-caps">Listing health</p>
          <h3>Publication mix</h3>
          <p className="text-muted">Current {range} snapshot</p>
          <div className="dash-donut">
            {insights ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={insights.health}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={83}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {insights.health.map((item) => (
                        <Cell
                          key={item.name}
                          fill={colors[item.tone]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dash-donut-center">
                  <strong>
                    {insights.health.reduce(
                      (sum, item) => sum + item.value,
                      0
                    )}
                  </strong>
                  <span className="text-xs text-muted">listings</span>
                </div>
              </>
            ) : (
              <Skeleton height="100%" />
            )}
          </div>
          <div className="dash-legend">
            {insights?.health.map((item) => (
              <div className="dash-row" key={item.name}>
                <span>
                  <i style={{ background: colors[item.tone] }} />
                  {item.name}
                </span>
                <b>{item.value}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Pipeline stages">
        <div className="dash-section-title">
          <p className="label-caps">Workflow status</p>
          <h3>Every step, in one view</h3>
        </div>
        <div className="dash-stages">
          {insights
            ? insights.stages.map((stage, i) => (
                <div className="card pad dash-stage" key={stage.label}>
                  <div className="dash-row">
                    <span className={`dash-tone dash-${stage.tone}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-muted">{stage.change}</span>
                  </div>
                  <h4>{stage.label}</h4>
                  <p className="text-xs text-muted">{stage.description}</p>
                  <div className="dash-row dash-stage-stat">
                    <strong>{stage.count.toLocaleString()}</strong>
                    <span className="text-xs text-muted">
                      {Math.round((stage.count / stage.total) * 100)}% of
                      imports
                    </span>
                  </div>
                  <div className="dash-track">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          (stage.count / stage.total) * 100
                        )}%`,
                        background: colors[stage.tone],
                      }}
                    />
                  </div>
                  <button
                    className="dash-link"
                    onClick={() => openStage(stage.path)}
                  >
                    View stage <ArrowRight size={15} />
                  </button>
                </div>
              ))
            : [0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={225} />
              ))}
        </div>
      </section>

      <section className="dash-bottom-grid" aria-label="Catalog and activity">
        <div className="card pad dash-chart">
          <p className="label-caps">Catalog distribution</p>
          <h3>Listings by category</h3>
          <p className="text-muted">
            Published products this {range === "weekly" ? "week" : "month"}
          </p>
          <div className="dash-bars">
            {insights ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={insights.categories}
                  layout="vertical"
                  margin={{ left: 0, right: 12 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="var(--border)"
                    strokeDasharray="3 4"
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={85}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="listings"
                    name="Listings"
                    fill="var(--primary)"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton height="100%" />
            )}
          </div>
        </div>

        <div className="card pad dash-activity">
          <p className="label-caps">Recent activity</p>
          <h3>What changed lately</h3>
          <div>
            {activity
              ? activity.map((event) => (
                  <div className="dash-event" key={event.id}>
                    <i className={`tone tone-${event.tone}`} />
                    <div>
                      <p>{event.message}</p>
                      <p className="text-xs text-muted">{event.time}</p>
                    </div>
                  </div>
                ))
              : [0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={40} />
                ))}
          </div>
        </div>
      </section>

      <section className="account-section" aria-label="Account connections">
        <div className="account-section-header">
          <div>
            <h3>Account connections</h3>
            <p>Accounts used to read and publish your catalog</p>
          </div>
          <button
            type="button"
            className="account-manage"
            onClick={() => navigate("/settings")}
          >
            Manage accounts <ArrowUpRight size={16} />
          </button>
        </div>

        {accountsError ? (
          <p className="account-message" role="alert">
            Accounts could not be loaded.
          </p>
        ) : connectedAccounts === null ? (
          <p className="account-message">Loading accounts…</p>
        ) : connectedAccounts.length === 0 ? (
          <p className="account-message">
            No Shopify or Amazon account connected yet.
          </p>
        ) : (
          <div className="account-grid">
            {connectedAccounts.map((account) => {
              const isShopify = account.name
                .toLowerCase()
                .includes("shopify");

              return (
                <article className="account-item" key={account.name}>
                  <span
                    className={`account-icon ${
                      isShopify ? "account-shopify" : "account-amazon"
                    }`}
                  >
                    {isShopify ? <Store size={22} /> : <Package size={22} />}
                  </span>

                  <div className="account-info">
                    <div className="account-name-line">
                      <h4>{account.name}</h4>
                      <span className="account-api">
                        {isShopify
                          ? "Admin GraphQL API"
                          : "Selling Partner API (SP-API)"}
                      </span>
                    </div>
                    <p title={account.detail}>{account.detail}</p>
                  </div>

                  <span className="account-status">
                    <CheckCircle2 size={14} /> Active
                  </span>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <StepFooter
        to="/dashboard/import"
        label="Continue to Shopify Import"
        stepIndex={3}
      />
    </AppShell>
  );
}
