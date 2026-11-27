import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  KeyRound,
  Layers,
  LogOut,
  Mail,
  Package,
  Plus,
  Shield,
  Store,
  User,
  Users,
} from "lucide-react";
import { AppShell } from "../components/layout/DashboardLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import {
  connectShopifyStoreApi,
  disconnectShopifyStoreApi,
  getConnectedShopifyStore,
} from "../api/shopifyService.js";
import {
  AMAZON_MARKETPLACES,
  connectAmazonSandboxApi,
  disconnectAmazonStoreApi,
  getAmazonStatusApi,
} from "../api/amazonService.js";
import "./SettingsPage.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "workspace";

  const { user, accessToken, logout } = useAuth();
  const { activeWorkspace, inviteLink, inviteMember, wsLoading } = useWorkspace();

  // Shopify State
  const [shopifyStore, setShopifyStore] = useState(null);
  const [shopInput, setShopInput] = useState("");
  const [shopifyBusy, setShopifyBusy] = useState(false);

  // Amazon State
  const [amazonStatus, setAmazonStatus] = useState({ connected: false });
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER");
  const [nickname, setNickname] = useState("");
  const [amazonBusy, setAmazonBusy] = useState(false);

  // Team Invite State
  const [inviteEmail, setInviteEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Account & Security State
  const [fullName, setFullName] = useState(user?.fullName || "Malaika Waris");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Inline Banner Feedback
  const [notice, setNotice] = useState(null);

  const showNotice = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    setFullName(user?.fullName || "Malaika Waris");
  }, [user]);

  // Load Active Workspace Connections
  useEffect(() => {
    const workspaceId = activeWorkspace?._id;
    if (!workspaceId) return;

    const savedShopify = getConnectedShopifyStore(workspaceId);
    if (savedShopify?.isActive) {
      setShopifyStore(savedShopify);
      setShopInput(savedShopify.shopDomain.replace(".myshopify.com", ""));
    } else {
      setShopifyStore(null);
    }

    let cancelled = false;
    getAmazonStatusApi({ workspaceId }, accessToken)
      .then((res) => {
        if (cancelled) return;
        if (res?.connected) {
          setAmazonStatus(res);
          if (res.marketplaceId) setMarketplaceId(res.marketplaceId);
          if (res.nickname) setNickname(res.nickname);
        } else {
          setAmazonStatus({ connected: false });
        }
      })
      .catch(() => {
        if (!cancelled) setAmazonStatus({ connected: false });
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace, accessToken]);

  const switchTab = (tab) => {
    setSearchParams({ tab }, { replace: true });
    setNotice(null);
  };

  // Shopify Connect / Disconnect
  const handleConnectShopify = async (e) => {
    e.preventDefault();
    if (!shopInput.trim()) {
      showNotice("error", "Please enter your Shopify store domain.");
      return;
    }
    setShopifyBusy(true);
    try {
      const res = await connectShopifyStoreApi({
        shop: shopInput,
        workspaceId: activeWorkspace?._id || "ws_demo_active",
      });
      if (res.mode === "mock") {
        setShopifyStore(res.store);
        showNotice("success", `Connected to ${res.store.shopDomain}`);
      }
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      setShopifyBusy(false);
    }
  };

  const handleDisconnectShopify = async () => {
    await disconnectShopifyStoreApi();
    setShopifyStore(null);
    showNotice("success", "Shopify store disconnected.");
  };

  // Amazon Connect / Disconnect
  const handleConnectAmazon = async (e) => {
    e.preventDefault();
    setAmazonBusy(true);
    try {
      const res = await connectAmazonSandboxApi(
        {
          workspaceId: activeWorkspace?._id || "ws_demo_active",
          marketplaceId,
          nickname,
        },
        accessToken
      );
      setAmazonStatus({
        connected: true,
        marketplaceId: res.store.marketplaceId,
        nickname: res.store.nickname,
      });
      showNotice("success", res.message || "Amazon SP-API connected.");
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      setAmazonBusy(false);
    }
  };

  const handleDisconnectAmazon = async () => {
    await disconnectAmazonStoreApi();
    setAmazonStatus({ connected: false });
    showNotice("success", "Amazon SP-API disconnected.");
  };

  // Team Invite
  const handleCopyLink = () => {
    const url =
      inviteLink ||
      `${window.location.origin}/join/${activeWorkspace?.slug || "workspace"}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showNotice("success", "Workspace invite link copied.");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await inviteMember({
        workspaceId: activeWorkspace?._id,
        email: inviteEmail.trim(),
      });
      setInviteEmail("");
      showNotice("success", "Invitation sent to teammate.");
    } catch (err) {
      showNotice("error", err.message);
    }
  };

  // Profile & Password Handlers
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showNotice("error", "Full name cannot be empty.");
      return;
    }
    showNotice("success", "Profile details updated.");
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showNotice("error", "New password must be at least 6 characters.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    showNotice("success", "Password updated successfully.");
  };

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    } else {
      localStorage.removeItem("amazonmap_access_token");
      localStorage.removeItem("amazonmap_user");
    }
    navigate("/auth", { replace: true });
  };

  const getMarketplaceName = (id) =>
    AMAZON_MARKETPLACES.find((m) => m.id === id)?.label || id;

  return (
    <AppShell
      title={
        activeTab === "security"
          ? "Account & Security"
          : "Workspace & Connections"
      }
      breadcrumb={[
        "Settings & Security",
        activeTab === "security"
          ? "Account & security"
          : "Workspace & connections",
      ]}
    >
      {/* Top Sub-Navigation Tabs */}
      <div className="stg-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "workspace"}
          className={`stg-tab ${activeTab === "workspace" ? "is-active" : ""}`}
          onClick={() => switchTab("workspace")}
        >
          <Layers size={15} />
          <span>Workspace &amp; Connections</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "security"}
          className={`stg-tab ${activeTab === "security" ? "is-active" : ""}`}
          onClick={() => switchTab("security")}
        >
          <Shield size={15} />
          <span>Account &amp; Security</span>
        </button>
      </div>

      {notice && (
        <div className={`stg-notice stg-notice--${notice.type}`} role="status">
          {notice.text}
        </div>
      )}

      {/* =========================================================
          TAB 1: WORKSPACE & CONNECTIONS (Stores + Workspace + Team)
         ========================================================= */}
      {activeTab === "workspace" && (
        <div className="stg-stack">
          {/* 1. Active Workspace Overview */}
          <section className="card pad stg-card">
            <div className="stg-card-head">
              <div>
                <h3>Active Workspace</h3>
                <p className="text-muted">
                  Central container for your catalog sync, rulesets, and listings.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline stg-inline-btn"
                onClick={() => navigate("/onboarding?new=true")}
              >
                <Plus size={15} />
                <span>New workspace</span>
              </button>
            </div>

            <div className="stg-ws-summary">
              <div>
                <span className="stg-meta-label">Workspace Name</span>
                <strong>{activeWorkspace?.name || "My Shopify Store"}</strong>
              </div>
              <div>
                <span className="stg-meta-label">Workspace Domain</span>
                <code>
                  {activeWorkspace?.slug || "my-shopify-store"}.amazonmap.ai
                </code>
              </div>
              <div>
                <span className="stg-meta-label">Environment</span>
                <span className="stg-env-pill">Sandbox Ready</span>
              </div>
            </div>
          </section>

          {/* 2. Store Integrations (Shopify + Amazon SP-API) */}
          <section className="card pad stg-card">
            <div className="stg-card-head">
              <div>
                <h3>Store Integrations</h3>
                <p className="text-muted">
                  Manage your Shopify source store and Amazon Seller Central SP-API.
                </p>
              </div>
            </div>

            <div className="stg-stores-grid">
              {/* Shopify Card */}
              <div className="stg-store-box">
                <div className="stg-store-top">
                  <div className="stg-store-icon stg-store-icon--shopify">
                    <Store size={20} />
                  </div>
                  <div className="stg-store-title">
                    <h4>Shopify Store</h4>
                    <span>Admin GraphQL API</span>
                  </div>
                  {shopifyStore?.isActive && (
                    <span className="stg-badge-active">
                      <CheckCircle2 size={13} /> Connected
                    </span>
                  )}
                </div>

                {shopifyStore?.isActive ? (
                  <div className="stg-connected-body">
                    <div className="stg-detail-row">
                      <span>Store Domain</span>
                      <strong>{shopifyStore.shopDomain}</strong>
                    </div>
                    <button
                      type="button"
                      className="stg-btn-danger-outline"
                      onClick={handleDisconnectShopify}
                    >
                      Disconnect Store
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleConnectShopify} className="stg-mini-form">
                    <div className="stg-domain-field">
                      <input
                        type="text"
                        placeholder="your-store-name"
                        value={shopInput}
                        onChange={(e) =>
                          setShopInput(
                            e.target.value.toLowerCase().replace(/\s+/g, "-")
                          )
                        }
                      />
                      <span>.myshopify.com</span>
                    </div>
                    <button
                      type="submit"
                      className="stg-btn-shopify"
                      disabled={!shopInput.trim() || shopifyBusy}
                    >
                      {shopifyBusy ? "Connecting..." : "Connect Shopify"}
                    </button>
                  </form>
                )}
              </div>

              {/* Amazon SP-API Card */}
              <div className="stg-store-box">
                <div className="stg-store-top">
                  <div className="stg-store-icon stg-store-icon--amazon">
                    <Package size={20} />
                  </div>
                  <div className="stg-store-title">
                    <h4>Amazon Seller Central</h4>
                    <span>Selling Partner API (SP-API)</span>
                  </div>
                  {amazonStatus.connected && (
                    <span className="stg-badge-active">
                      <CheckCircle2 size={13} /> Connected
                    </span>
                  )}
                </div>

                {amazonStatus.connected ? (
                  <div className="stg-connected-body">
                    <div className="stg-detail-row">
                      <span>Nickname</span>
                      <strong>{amazonStatus.nickname || "Sandbox Store"}</strong>
                    </div>
                    <div className="stg-detail-row">
                      <span>Marketplace</span>
                      <strong>
                        {getMarketplaceName(amazonStatus.marketplaceId)}
                      </strong>
                    </div>
                    <button
                      type="button"
                      className="stg-btn-danger-outline"
                      onClick={handleDisconnectAmazon}
                    >
                      Disconnect Amazon
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleConnectAmazon} className="stg-mini-form">
                    <select
                      className="stg-input"
                      value={marketplaceId}
                      onChange={(e) => setMarketplaceId(e.target.value)}
                    >
                      {AMAZON_MARKETPLACES.map((mp) => (
                        <option key={mp.id} value={mp.id}>
                          {mp.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="stg-input"
                      placeholder="Nickname (e.g., My US Store)"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="stg-btn-amazon"
                      disabled={amazonBusy}
                    >
                      {amazonBusy ? "Connecting..." : "Connect Amazon SP-API"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* 3. Team Members & Invite Link */}
          <section className="card pad stg-card">
            <div className="stg-card-head">
              <div>
                <h3>Team Access</h3>
                <p className="text-muted">
                  Invite teammates to review mappings and approve Amazon listings.
                </p>
              </div>
            </div>

            <div className="stg-team-grid">
              <div className="stg-field">
                <label>Shareable Invite Link</label>
                <div className="stg-inline-row">
                  <input
                    type="text"
                    readOnly
                    className="stg-input stg-input--readonly"
                    value={
                      inviteLink ||
                      `${window.location.origin}/join/${
                        activeWorkspace?.slug || "my-shopify-store"
                      }`
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-outline stg-inline-btn"
                    onClick={handleCopyLink}
                  >
                    <Copy size={14} />
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleInviteSubmit} className="stg-field">
                <label>Invite by Email</label>
                <div className="stg-inline-row">
                  <input
                    type="email"
                    className="stg-input"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="stg-btn-shopify stg-btn-compact"
                    disabled={!inviteEmail.trim() || wsLoading}
                  >
                    <Users size={14} />
                    <span>Send Invite</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================
          TAB 2: ACCOUNT & SECURITY (Profile + Password + Session)
         ========================================================= */}
      {activeTab === "security" && (
        <div className="stg-stack">
          {/* 1. Profile Details */}
          <section className="card pad stg-card">
            <div className="stg-card-head">
              <div>
                <h3>Seller Profile</h3>
                <p className="text-muted">
                  Your personal account details used for listing approval audits.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="stg-form-grid">
              <div className="stg-field">
                <label htmlFor="profile-name">
                  <User size={13} /> Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  className="stg-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="stg-field">
                <label htmlFor="profile-email">
                  <Mail size={13} /> Email Address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  readOnly
                  className="stg-input stg-input--readonly"
                  value={user?.email || "malaika@amazonmap.ai"}
                />
              </div>

              <div className="stg-form-actions">
                <button type="submit" className="stg-btn-shopify stg-btn-compact">
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* 2. Password & JWT Session */}
          <section className="card pad stg-card">
            <div className="stg-card-head">
              <div>
                <h3>Password &amp; Authentication</h3>
                <p className="text-muted">
                  Update your password and manage your active JWT session.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="stg-form-grid">
              <div className="stg-field">
                <label htmlFor="cur-pass">
                  <KeyRound size={13} /> Current Password
                </label>
                <input
                  id="cur-pass"
                  type="password"
                  className="stg-input"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="stg-field">
                <label htmlFor="new-pass">
                  <KeyRound size={13} /> New Password
                </label>
                <input
                  id="new-pass"
                  type="password"
                  className="stg-input"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="stg-form-actions">
                <button
                  type="submit"
                  className="btn btn-outline"
                  disabled={!currentPassword || !newPassword}
                >
                  Update Password
                </button>
              </div>
            </form>

            <div className="stg-session-bar">
              <div>
                <strong>Current Session</strong>
                <p className="text-xs text-muted">
                  Authenticated via JWT Bearer token · Active now
                </p>
              </div>
              <button
                type="button"
                className="stg-btn-danger-outline"
                onClick={handleLogout}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}