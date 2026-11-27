import React, { useState } from "react";
import { Bell, Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";

export default function DashboardHeader({ title, breadcrumb }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = user?.fullName || "Malaika Waris";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <header className="topbar">
      <div className="topbar-title">
        <div className="breadcrumb">
          {breadcrumb &&
            breadcrumb.map((crumb, i) => (
              <span key={i}>
                {crumb} {i < breadcrumb.length - 1 && <ChevronRight size={12} />}
              </span>
            ))}
        </div>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        {activeWorkspace && (
          <button
            type="button"
            className="topbar-ws-pill"
            onClick={() => navigate("/dashboard/settings")}
            title="Manage workspace & store connections"
          >
            <span className="topbar-ws-dot" />
            <span>{activeWorkspace.name}</span>
          </button>
        )}

        <div className="search">
          <Search size={16} style={{ color: "var(--muted-foreground)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, SKUs..."
          />
        </div>

        <button
          type="button"
          className="icon-btn"
          aria-label="Notifications"
          onClick={() => navigate("/dashboard/notifications")}
        >
          <Bell size={19} />
          <span className="dot" />
        </button>

        <button
          type="button"
          className="account"
          onClick={() => navigate("/dashboard/settings")}
          title="Account & workspace settings"
        >
          <div className="avatar">{initials || "MW"}</div>
          <div className="account-text">
            <div className="account-name">{displayName}</div>
            <div className="account-role">{user?.role || "Workspace owner"}</div>
          </div>
        </button>
      </div>
    </header>
  );
}