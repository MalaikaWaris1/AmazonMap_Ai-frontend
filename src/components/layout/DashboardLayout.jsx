import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronRight, Lock, Settings, ShieldCheck } from "lucide-react";
// 1. YAHAN CHANGE KIYA HAI: Naya DashboardHeader import kiya hai
import DashboardHeader from "./DashboardHeader.jsx"; 
import { STEPS, usePipeline } from "../../context/PipelineContext.jsx";

function Curtain() {
  const { pathname } = useLocation();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(true);
    const t = setTimeout(() => setPlaying(false), 820);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!playing) return null;
  return (
    <div key={pathname} className="curtain">
      <div className="curtain-panel curtain-left" />
      <div className="curtain-panel curtain-right" />
    </div>
  );
}

function Sidebar() {
  const { unlocked, completed } = usePipeline();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="brand-name">AmazonMapAI</p>
          <p className="text-muted text-xs">Shopify → Amazon sync</p>
        </div>
      </div>

      <div className="sidebar-progress">
        <div className="row-between">
          <span className="label-caps">Pipeline</span>
          <span className="text-xs text-muted">
            {completed.length}/{STEPS.length}
          </span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${(completed.length / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <nav className="sidebar-nav">
        {STEPS.map((step, i) => {
          const isActive = Boolean(step.path) && (pathname === step.path || (pathname === "/" && step.path === "/dashboard"));
          const isDone = completed.includes(i);
          const isLocked = i > unlocked;
          const Icon = step.icon;
          return (
            <button
              key={step.label}
              type="button"
              disabled={isLocked || !step.path}
              onClick={() => { if (step.path) navigate(step.path); }}
              className={`nav-item ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
            >
              <span className={`step-num ${isDone ? "done" : ""} ${isActive && !isDone ? "current" : ""}`}>
                {isDone ? <Check size={16} /> : isLocked ? <Lock size={14} /> : i + 1}
              </span>
              <span className="nav-text">
                <span className="truncate">{step.label}</span>
                <span className="truncate text-xs text-muted">{step.short}</span>
              </span>
              <Icon size={16} className="nav-icon" />
            </button>
          );
        })}

        <div className="nav-section">
          <span className="label-caps">Settings &amp; Security</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard/settings")}
          className={`nav-item simple ${pathname === "/settings" ? "active" : ""}`}
        >
          <Settings size={16} />
          Account &amp; security
        </button>
      </nav>
    </aside>
  );
}

export function AppShell({ title, breadcrumb, children }) {
  return (
    <div className="shell">
      <Curtain />
      <Sidebar />
      <div className="shell-main">
        {/* 2. YAHAN CHANGE KIYA HAI: Purane <Header /> ki jagah <DashboardHeader /> lagaya hai */}
        <DashboardHeader title={title} breadcrumb={breadcrumb} />
        <main className="content">
          <div className="content-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function StepFooter({ to, label, stepIndex, back }) {
  const { unlock } = usePipeline();
  const navigate = useNavigate();
  return (
    <div className="step-footer">
      {back ? (
        <button className="btn btn-outline" onClick={() => navigate(back.to)}>
          {back.label}
        </button>
      ) : (
        <span />
      )}
      <button
        className="btn btn-primary btn-lg"
        onClick={() => {
          unlock(stepIndex);
          navigate(to);
        }}
      >
        {label}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function Skeleton({ height = 40, style }) {
  return <div className="skeleton" style={{ height, ...style }} />;
}