import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  Lock,
  Plus,
  Settings,
  ShieldCheck,
  Store,
} from "lucide-react";
import DashboardHeader from "./DashboardHeader.jsx";
import { STEPS, usePipeline } from "../../context/PipelineContext.jsx";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";
import "./DashboardLayout.css";

const WORKSPACE_LIST_KEY = "amazonmap_workspaces_list";

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
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const [wsMenuOpen, setWsMenuOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const switcherRef = useRef(null);

  // Sync created workspaces list for quick switching
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WORKSPACE_LIST_KEY) || "[]");
      let list = Array.isArray(saved) ? saved : [];

      if (activeWorkspace?._id) {
        const exists = list.some((w) => w._id === activeWorkspace._id);
        if (!exists) {
          list = [activeWorkspace, ...list];
          localStorage.setItem(WORKSPACE_LIST_KEY, JSON.stringify(list));
        }
      }
      setWorkspaces(list);
    } catch {
      setWorkspaces(activeWorkspace ? [activeWorkspace] : []);
    }
  }, [activeWorkspace]);

  // Close workspace dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setWsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSwitchWorkspace = (ws) => {
    setActiveWorkspace(ws);
    localStorage.setItem("amazonmap_active_workspace", JSON.stringify(ws));
    setWsMenuOpen(false);
  };

  const currentTab = new URLSearchParams(search).get("tab") || "workspace";
  const isSettingsPath =
    pathname === "/dashboard/settings" || pathname === "/settings";

  return (
    <aside className="sidebar">
      {/* SaaS Workspace Switcher */}
      <div className="ws-switcher-wrap" ref={switcherRef}>
        <button
          type="button"
          className={`brand ws-switcher-btn ${wsMenuOpen ? "is-open" : ""}`}
          onClick={() => setWsMenuOpen((prev) => !prev)}
          aria-expanded={wsMenuOpen}
        >
          <div className="brand-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="ws-switcher-meta">
            <p className="brand-name truncate">
              {activeWorkspace?.name || "AmazonMapAI"}
            </p>
            <p className="text-muted text-xs truncate">
              {activeWorkspace?.slug
                ? `${activeWorkspace.slug}.amazonmap.ai`
                : "Shopify → Amazon sync"}
            </p>
          </div>
          <ChevronsUpDown size={15} className="ws-switcher-chevron" />
        </button>

        {wsMenuOpen && (
          <div className="ws-popover" role="menu">
            <div className="ws-popover-head">Workspaces</div>

            <div className="ws-popover-list">
              {workspaces.length > 0 ? (
                workspaces.map((ws) => {
                  const isCurrent = ws._id === activeWorkspace?._id;
                  return (
                    <button
                      key={ws._id}
                      type="button"
                      role="menuitem"
                      className={`ws-popover-item ${isCurrent ? "is-selected" : ""}`}
                      onClick={() => handleSwitchWorkspace(ws)}
                    >
                      <span className="ws-item-badge">
                        {(ws.name?.[0] || "W").toUpperCase()}
                      </span>
                      <span className="ws-item-info">
                        <strong className="truncate">{ws.name}</strong>
                        <small className="truncate">{ws.slug}.amazonmap.ai</small>
                      </span>
                      {isCurrent && <Check size={14} className="ws-item-check" />}
                    </button>
                  );
                })
              ) : (
                <div className="ws-popover-empty">Default workspace</div>
              )}
            </div>

            <div className="ws-popover-footer">
              <button
                type="button"
                className="ws-popover-action"
                onClick={() => {
                  setWsMenuOpen(false);
                  navigate("/onboarding?new=true");
                }}
              >
                <Plus size={14} />
                <span>Create new workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Progress */}
      <div className="sidebar-progress">
        <div className="row-between">
          <span className="label-caps">Pipeline</span>
          <span className="text-xs text-muted">
            {completed.length}/{STEPS.length}
          </span>
        </div>
        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: `${(completed.length / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Pipeline Steps */}
      <nav className="sidebar-nav">
        {STEPS.map((step, i) => {
          const isActive =
            Boolean(step.path) &&
            (pathname === step.path ||
              (pathname === "/" && step.path === "/dashboard"));
          const isDone = completed.includes(i);
          const isLocked = i > unlocked;
          const Icon = step.icon;

          return (
            <button
              key={step.label}
              type="button"
              disabled={isLocked || !step.path}
              onClick={() => {
                if (step.path) navigate(step.path);
              }}
              className={`nav-item ${isActive ? "active" : ""} ${
                isLocked ? "locked" : ""
              }`}
            >
              <span
                className={`step-num ${isDone ? "done" : ""} ${
                  isActive && !isDone ? "current" : ""
                }`}
              >
                {isDone ? <Check size={15} /> : isLocked ? <Lock size={13} /> : i + 1}
              </span>
              <span className="nav-text">
                <span className="truncate nav-label">{step.label}</span>
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
          onClick={() => navigate("/dashboard/settings?tab=workspace")}
          className={`nav-item simple ${
            isSettingsPath && currentTab === "workspace" ? "active" : ""
          }`}
        >
          <Store size={16} />
          <span>Workspace &amp; connections</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard/settings?tab=security")}
          className={`nav-item simple ${
            isSettingsPath && currentTab === "security" ? "active" : ""
          }`}
        >
          <Settings size={16} />
          <span>Account &amp; security</span>
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