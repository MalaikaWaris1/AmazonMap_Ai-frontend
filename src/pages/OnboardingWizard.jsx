import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import {
    connectShopifyStoreApi,
    getConnectedShopifyStore,
    disconnectShopifyStoreApi,
    formatShopDomain,
} from "../api/shopifyService.js";
import {
    AMAZON_MARKETPLACES,
    connectAmazonSandboxApi,
    getAmazonStatusApi,
    disconnectAmazonStoreApi,
} from "../api/amazonService.js";
import brandLogo from "../assets/logo.jpeg";
import "./OnboardingWizard.css";

const EXAMPLE_WORKSPACE_NAMES = [
    "My Shopify Store",
    "Main Brand Catalog",
    "US Apparel Store",
    "Electronics Hub",
    "Q4 Launch Team",
];

const WIZARD_STEPS = ["Workspace", "Shopify", "Amazon", "Complete"];

const toSlug = (text) =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "");

export default function OnboardingWizard() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, accessToken } = useAuth();
    const {
        activeWorkspace,
        setActiveWorkspace,
        inviteLink,
        createWorkspace,
        inviteMember,
        wsLoading,
    } = useWorkspace();

    // Onboarding Phases: "workspace" | "shopify" | "amazon" | "complete"
    const [phase, setPhase] = useState("workspace");
    const [wsStep, setWsStep] = useState(1);
    const [checkingSetup, setCheckingSetup] = useState(true);
    const initialCheckDone = useRef(false);

    const defaultSuggestedSlug = user?.fullName
        ? `${toSlug(user.fullName)}-store`
        : "my-amazon-hub";

    const [slug, setSlug] = useState(defaultSuggestedSlug);
    const [name, setName] = useState("My Shopify Store");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    // Team Invite States
    const [inviteEmail, setInviteEmail] = useState("");
    const [invitedEmails, setInvitedEmails] = useState([]);
    const [copiedLink, setCopiedLink] = useState(false);
    const [setupProgress, setSetupProgress] = useState(0);

    // Shopify Store States
    const [shopInput, setShopInput] = useState("");
    const [shopifyStore, setShopifyStore] = useState(null);
    const [isShopifyConnecting, setIsShopifyConnecting] = useState(false);

    // Amazon Store States
    const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER");
    const [nickname, setNickname] = useState("");
    const [amazonStatus, setAmazonStatus] = useState({ connected: false });
    const [isAmazonConnecting, setIsAmazonConnecting] = useState(false);

    // Floating Popup Notification
    const [alertPopup, setAlertPopup] = useState(null);

    const showPopup = (type, title, message) => {
        setAlertPopup({ type, title, message });
    };

    useEffect(() => {
        if (!alertPopup) return;
        const timer = setTimeout(() => setAlertPopup(null), 4500);
        return () => clearTimeout(timer);
    }, [alertPopup]);

    // Clean Reset to Step 1 (For Creating New Workspace / Viva Demo)
    const resetToNewWorkspace = (notify = false) => {
        localStorage.removeItem("amazonmap_active_workspace");
        localStorage.removeItem("amazonmap_invite_link");
        localStorage.removeItem("amazonmap_shopify_store");
        localStorage.removeItem("amazonmap_amazon_store");

        setActiveWorkspace(null);
        setShopifyStore(null);
        setShopInput("");
        setAmazonStatus({ connected: false });
        setNickname("");
        setInvitedEmails([]);
        setSlug(defaultSuggestedSlug);
        setName("My Shopify Store");
        setSlugManuallyEdited(false);
        setPhase("workspace");
        setWsStep(1);

        if (notify) {
            showPopup("success", "New Workspace", "Starting fresh from Step 1.");
        }
    };

    // Handle Shopify OAuth Callback (?shopify_status=success | failed)
    useEffect(() => {
        const shopifyStatus = searchParams.get("shopify_status");
        if (!shopifyStatus) return;

        initialCheckDone.current = true;
        setCheckingSetup(false);

        if (shopifyStatus === "success") {
            setPhase("amazon");
            showPopup("success", "Shopify Authorized", "Your Shopify store is now connected.");
        } else if (shopifyStatus === "failed") {
            setPhase("shopify");
            showPopup(
                "error",
                "Shopify Authorization Failed",
                "Shopify se connection complete nahi ho saka. Dobara try karein."
            );
        }
        setSearchParams({}, { replace: true });
    }, [searchParams, setSearchParams]);

    // Check Existing Setup Once on Load
    useEffect(() => {
        if (initialCheckDone.current) return;
        initialCheckDone.current = true;

        const isNewMode = searchParams.get("new") === "true";

        const checkExistingProgress = async () => {
            if (isNewMode || !activeWorkspace?._id) {
                if (isNewMode) {
                    resetToNewWorkspace(false);
                    setSearchParams({}, { replace: true });
                }
                setCheckingSetup(false);
                return;
            }

            const workspaceId = activeWorkspace._id;
            setName(activeWorkspace.name || "My Shopify Store");
            setSlug(activeWorkspace.slug || defaultSuggestedSlug);

            // 1. Check Shopify
            const savedShopify = getConnectedShopifyStore(workspaceId);
            const hasShopify = Boolean(savedShopify?.isActive);
            if (hasShopify) {
                setShopifyStore(savedShopify);
                setShopInput(savedShopify.shopDomain.replace(".myshopify.com", ""));
            }

            // 2. Check Amazon
            let hasAmazon = false;
            try {
                const statusRes = await getAmazonStatusApi({ workspaceId }, accessToken);
                if (statusRes?.connected) {
                    hasAmazon = true;
                    setAmazonStatus(statusRes);
                    if (statusRes.marketplaceId) setMarketplaceId(statusRes.marketplaceId);
                    if (statusRes.nickname) setNickname(statusRes.nickname);
                }
            } catch {
                hasAmazon = false;
            }

            // 3. Route to right step or Dashboard
            if (hasShopify && hasAmazon) {
                navigate("/dashboard", { replace: true });
                return;
            } else if (hasShopify) {
                setPhase("amazon");
            } else {
                setPhase("shopify");
            }

            setCheckingSetup(false);
        };

        checkExistingProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Step 4 Loader -> Move to Shopify Connection
    useEffect(() => {
        if (phase === "workspace" && wsStep === 4) {
            setSetupProgress(25);
            const t1 = setTimeout(() => setSetupProgress(65), 350);
            const t2 = setTimeout(() => setSetupProgress(100), 800);
            const t3 = setTimeout(() => setPhase("shopify"), 1250);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        }
    }, [phase, wsStep]);

    const isSlugValid = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug);

    const handleSlugChange = (e) => {
        const formatted = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
        setSlug(formatted);
        setSlugManuallyEdited(true);
        if (alertPopup) setAlertPopup(null);
    };

    const handleNameChange = (val) => {
        setName(val);
        if (!slugManuallyEdited && val.trim()) {
            setSlug(toSlug(val));
        }
        if (alertPopup) setAlertPopup(null);
    };

    const handleStep1Continue = (e) => {
        e.preventDefault();
        if (!isSlugValid) {
            showPopup(
                "error",
                "Invalid Workspace URL",
                "Use 3–40 lowercase letters, numbers, or hyphens."
            );
            return;
        }
        setWsStep(2);
    };

    const handleCreateWorkspaceSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            showPopup("error", "Workspace Name Required", "Please enter or select a workspace name.");
            return;
        }
        try {
            await createWorkspace({ name: name.trim(), slug: slug.trim() });
            setWsStep(3);
        } catch (err) {
            showPopup("error", "Workspace Creation Failed", err.message);
            if (err.message?.toLowerCase().includes("url") || err.message?.toLowerCase().includes("taken")) {
                setWsStep(1);
            }
        }
    };

    const handleCopyInviteLink = () => {
        const linkToCopy =
            inviteLink || `${window.location.origin}/join/${slug}?token=preview-token`;
        navigator.clipboard.writeText(linkToCopy);
        setCopiedLink(true);
        showPopup("success", "Invite Link Copied", "Workspace link copied to clipboard.");
        setTimeout(() => setCopiedLink(false), 2200);
    };

    const handleSendEmailInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        try {
            const res = await inviteMember({
                workspaceId: activeWorkspace?._id,
                email: inviteEmail.trim(),
            });
            setInvitedEmails((prev) => [...new Set([...prev, inviteEmail.trim()])]);
            setInviteEmail("");
            showPopup("success", "Invitation Sent", res.message || "Teammate invited successfully.");
        } catch (err) {
            showPopup("error", "Invite Failed", err.message);
        }
    };

    // Connect Shopify Store
    const handleConnectShopify = async (e) => {
        e.preventDefault();
        if (!shopInput.trim()) {
            showPopup("error", "Store Domain Required", "Apna Shopify store name enter karein.");
            return;
        }

        setIsShopifyConnecting(true);
        try {
            const result = await connectShopifyStoreApi({
                shop: shopInput,
                workspaceId: activeWorkspace?._id || "ws_demo_active",
            });

            if (result.mode === "mock") {
                setShopifyStore(result.store);
                showPopup(
                    "success",
                    "Shopify Store Connected",
                    `${result.store.shopDomain} linked to ${activeWorkspace?.name || name}.`
                );
            }
        } catch (err) {
            showPopup("error", "Shopify Connection Error", err.message);
        } finally {
            setIsShopifyConnecting(false);
        }
    };

    const handleDisconnectShopify = async () => {
        await disconnectShopifyStoreApi();
        setShopifyStore(null);
        showPopup("success", "Store Disconnected", "You can now connect another Shopify store.");
    };

    // Connect Amazon Sandbox
    const handleConnectAmazon = async (e) => {
        e.preventDefault();
        const workspaceId = activeWorkspace?._id || "ws_demo_active";

        if (!marketplaceId) {
            showPopup("error", "Marketplace Required", "Please select a marketplace region.");
            return;
        }

        setIsAmazonConnecting(true);
        try {
            const response = await connectAmazonSandboxApi(
                { workspaceId, marketplaceId, nickname },
                accessToken
            );

            setAmazonStatus({
                connected: true,
                marketplaceId: response.store.marketplaceId,
                nickname: response.store.nickname,
                environment: response.store.environment || "sandbox",
            });

            showPopup(
                "success",
                "Amazon SP-API Connected",
                response.message || "Sandbox environment successfully connected!"
            );
        } catch (err) {
            showPopup("error", "Amazon Connection Failed", err.message);
        } finally {
            setIsAmazonConnecting(false);
        }
    };

    const handleDisconnectAmazon = async () => {
        await disconnectAmazonStoreApi();
        setAmazonStatus({ connected: false });
        showPopup("success", "Amazon Disconnected", "You can select another marketplace.");
    };

    const getSelectedMarketplaceLabel = (mpId) => {
        const found = AMAZON_MARKETPLACES.find((m) => m.id === mpId);
        return found ? found.label : mpId;
    };

    const getWizardStepNumber = () => {
        if (phase === "shopify") return 2;
        if (phase === "amazon") return 3;
        if (phase === "complete") return 4;
        return 1;
    };

    // Header badge sirf tab dikhayein jab current flow mein workspace ban chuka ho
    const showWorkspaceBadge =
        Boolean(activeWorkspace) && (phase !== "workspace" || wsStep >= 3);

    if (checkingSetup) {
        return (
            <div className="onb-viewport">
                <header className="onb-topbar">
                    <div className="onb-logo-wrap">
                        <img src={brandLogo} alt="AmazonMap AI" className="onb-topbar-logo" />
                    </div>
                </header>
                <main className="wizard-stage">
                    <div className="jira-modal jira-modal--loader">
                        <div className="loader-brand-badge">
                            <span>A</span>
                        </div>
                        <h2>Loading workspace...</h2>
                        <div className="jira-progress-track">
                            <div className="jira-progress-fill" style={{ width: "65%" }}></div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="onb-viewport">
            {/* Floating Exception / Notification Popup */}
            {alertPopup && (
                <div className={`onb-popup onb-popup--${alertPopup.type}`} role="alert">
                    <div className="onb-popup-badge">
                        {alertPopup.type === "error" ? "!" : "✓"}
                    </div>
                    <div className="onb-popup-body">
                        <strong>{alertPopup.title}</strong>
                        <p>{alertPopup.message}</p>
                    </div>
                    <button
                        type="button"
                        className="onb-popup-close"
                        onClick={() => setAlertPopup(null)}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Clean Top Bar with Pure White Logo Background */}
            <header className="onb-topbar">
                <div className="onb-logo-wrap">
                    <img src={brandLogo} alt="AmazonMap AI" className="onb-topbar-logo" />
                </div>

                {showWorkspaceBadge && (
                    <div className="onb-ws-badge">
                        <span className="onb-ws-dot"></span>
                        <span>{activeWorkspace.name}</span>
                        <code>{activeWorkspace.slug}.amazonmap.ai</code>
                        <button
                            type="button"
                            className="onb-ws-new-btn"
                            onClick={() => resetToNewWorkspace(true)}
                            title="Create a new workspace from Step 1"
                        >
                            + New
                        </button>
                    </div>
                )}

                <div className="onb-user-chip">
                    <span className="onb-user-dot"></span>
                    <span>{user?.fullName || "Seller"}</span>
                </div>
            </header>

            {/* =========================================================
                PHASE 1: JIRA-INSPIRED WORKSPACE CREATION
               ========================================================= */}
            {phase === "workspace" && (
                <main className="onb-stage-area">
                    <div className="onb-bg-skeleton" aria-hidden="true">
                        <div className="skel-col">
                            <div className="skel-head"></div>
                            <div className="skel-card"></div>
                            <div className="skel-card"></div>
                        </div>
                        <div className="skel-col">
                            <div className="skel-head"></div>
                            <div className="skel-card"></div>
                            <div className="skel-card"></div>
                        </div>
                        <div className="skel-col">
                            <div className="skel-head"></div>
                            <div className="skel-card"></div>
                        </div>
                    </div>

                    {/* STEP 1: Create Workspace URL */}
                    {wsStep === 1 && (
                        <div className="jira-modal jira-modal--compact">
                            <div className="jira-spark-title">
                                <h2>Create a workspace</h2>
                                <span className="jira-sparks" aria-hidden="true">
                                    <i></i>
                                    <i></i>
                                    <i></i>
                                </span>
                            </div>
                            <p className="jira-subtitle">
                                Workspaces are the shared space where you organize store
                                connections, catalog mappings, and Amazon listings.
                            </p>

                            <form onSubmit={handleStep1Continue} className="jira-form">
                                <label className="jira-label" htmlFor="ws-slug">
                                    Your workspace URL
                                </label>
                                <div className={`jira-url-box ${isSlugValid ? "is-valid" : ""}`}>
                                    <input
                                        id="ws-slug"
                                        type="text"
                                        value={slug}
                                        onChange={handleSlugChange}
                                        placeholder="your-store-name"
                                        autoFocus
                                    />
                                    <span className="jira-url-domain">.amazonmap.ai</span>
                                    {isSlugValid && (
                                        <span className="jira-valid-check" title="URL available">
                                            ✓
                                        </span>
                                    )}
                                </div>
                                <p className="jira-hint">
                                    This workspace URL is just a suggestion. Feel free to change it
                                    to something your team will recognize.
                                </p>

                                <button
                                    type="submit"
                                    className="jira-btn-primary jira-btn-full"
                                    disabled={!isSlugValid}
                                >
                                    Continue
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 2: Name Your Workspace */}
                    {wsStep === 2 && (
                        <div className="jira-modal jira-modal--split">
                            <div className="jira-split-left">
                                <h2>Name your workspace</h2>
                                <p className="jira-subtitle">
                                    This is where you&apos;ll sync Shopify products, validate rules,
                                    and manage Amazon listings.
                                </p>

                                <form onSubmit={handleCreateWorkspaceSubmit} className="jira-form">
                                    <label className="jira-label" htmlFor="ws-name">
                                        Name your workspace
                                    </label>
                                    <input
                                        id="ws-name"
                                        className="jira-input"
                                        type="text"
                                        value={name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="e.g. My Shopify Store"
                                        autoFocus
                                    />

                                    <span className="jira-pills-label">Example workspace names:</span>
                                    <div className="jira-pills-wrap">
                                        {EXAMPLE_WORKSPACE_NAMES.map((sample) => (
                                            <button
                                                key={sample}
                                                type="button"
                                                className={`jira-pill ${
                                                    name === sample ? "is-selected" : ""
                                                }`}
                                                onClick={() => handleNameChange(sample)}
                                            >
                                                {sample}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="jira-actions-row">
                                        <button
                                            type="button"
                                            className="jira-btn-ghost"
                                            onClick={() => setWsStep(1)}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="jira-btn-primary"
                                            disabled={!name.trim() || wsLoading}
                                        >
                                            {wsLoading ? "Creating..." : "Continue"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="jira-split-right">
                                <div className="preview-backdrop-shopify"></div>
                                <div className="preview-backdrop-amazon"></div>

                                <div className="preview-board-card">
                                    <div className="preview-board-top">
                                        <div>
                                            <h4 className="preview-board-title">
                                                {name.trim() || "My Shopify Store"}
                                            </h4>
                                            <span className="preview-board-url">
                                                {slug}.amazonmap.ai
                                            </span>
                                        </div>
                                        <div className="preview-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>

                                    <div className="preview-tabs">
                                        <span className="is-active">Pipeline</span>
                                        <span>Catalog</span>
                                        <span>Validation</span>
                                        <span>Amazon</span>
                                    </div>

                                    <div className="preview-columns">
                                        <div className="preview-col">
                                            <span className="preview-col-tag">IMPORTED</span>
                                            <div className="preview-mini-card">
                                                <div className="mini-line"></div>
                                                <span className="mini-sq mini-sq--lime"></span>
                                            </div>
                                            <div className="preview-mini-card">
                                                <div className="mini-line short"></div>
                                                <span className="mini-sq mini-sq--amber"></span>
                                            </div>
                                        </div>

                                        <div className="preview-col">
                                            <span className="preview-col-tag">VALIDATED</span>
                                            <div className="preview-mini-card">
                                                <div className="mini-line"></div>
                                                <span className="mini-sq mini-sq--green"></span>
                                            </div>
                                            <div className="preview-mini-card">
                                                <div className="mini-line short"></div>
                                                <span className="mini-sq mini-sq--green"></span>
                                            </div>
                                        </div>

                                        <div className="preview-col">
                                            <span className="preview-col-tag">LISTED</span>
                                            <div className="preview-mini-card">
                                                <div className="mini-line"></div>
                                                <span className="mini-sq mini-sq--amber"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Invite Team Members */}
                    {wsStep === 3 && (
                        <div className="jira-modal jira-modal--split">
                            <div className="jira-split-left">
                                <h2>Work faster with your team</h2>
                                <p className="jira-subtitle">
                                    AmazonMap AI works better with your catalog team onboard. Invite
                                    a teammate to review and approve listings.
                                </p>

                                <div className="jira-form">
                                    <label className="jira-label">Share via link</label>
                                    <div className="jira-copy-row">
                                        <input
                                            type="text"
                                            readOnly
                                            className="jira-input jira-input--readonly"
                                            value={
                                                inviteLink ||
                                                `${window.location.origin}/join/${slug}?token=${
                                                    activeWorkspace?.inviteToken || "inv89x"
                                                }`
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="jira-btn-outline"
                                            onClick={handleCopyInviteLink}
                                        >
                                            {copiedLink ? "✓ Copied" : "Copy link"}
                                        </button>
                                    </div>

                                    <form onSubmit={handleSendEmailInvite} className="jira-invite-form">
                                        <label className="jira-label" htmlFor="invite-email">
                                            Invite via email
                                        </label>
                                        <div className="jira-copy-row">
                                            <input
                                                id="invite-email"
                                                type="email"
                                                className="jira-input"
                                                placeholder="e.g. sara@company.com"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                            />
                                            <button
                                                type="submit"
                                                className="jira-btn-outline"
                                                disabled={!inviteEmail.trim() || wsLoading}
                                            >
                                                Invite
                                            </button>
                                        </div>
                                    </form>

                                    {invitedEmails.length > 0 && (
                                        <div className="invited-chips">
                                            {invitedEmails.map((em) => (
                                                <span key={em} className="invited-chip">
                                                    ✓ {em}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="jira-actions-row">
                                        <button
                                            type="button"
                                            className="jira-btn-ghost"
                                            onClick={() => setWsStep(4)}
                                        >
                                            Do this later
                                        </button>
                                        <button
                                            type="button"
                                            className="jira-btn-primary"
                                            onClick={() => setWsStep(4)}
                                        >
                                            Get started
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="jira-split-right">
                                <div className="preview-backdrop-shopify"></div>
                                <div className="preview-backdrop-amazon"></div>

                                <div className="preview-board-card">
                                    <div className="preview-board-top">
                                        <div>
                                            <h4 className="preview-board-title">
                                                {activeWorkspace?.name || name}
                                            </h4>
                                            <span className="preview-board-url">
                                                {slug}.amazonmap.ai
                                            </span>
                                        </div>
                                        <div className="preview-avatars">
                                            <span className="p-avatar p-avatar--green">
                                                {(user?.fullName?.[0] || "M").toUpperCase()}
                                            </span>
                                            <span className="p-avatar p-avatar--amber">
                                                {invitedEmails[0]?.[0]?.toUpperCase() || "T"}
                                            </span>
                                            <span className="p-avatar p-avatar--add">+</span>
                                        </div>
                                    </div>

                                    <div className="preview-tabs">
                                        <span className="is-active">Pipeline</span>
                                        <span>Catalog</span>
                                        <span>Validation</span>
                                        <span>Amazon</span>
                                    </div>

                                    <div className="preview-columns">
                                        <div className="preview-col">
                                            <span className="preview-col-tag">IMPORTED</span>
                                            <div className="preview-mini-card">
                                                <div className="mini-line"></div>
                                                <span className="mini-tag mini-tag--amber">@admin</span>
                                            </div>
                                        </div>

                                        <div className="preview-col">
                                            <span className="preview-col-tag">REVIEW</span>
                                            <div className="preview-mini-card">
                                                <div className="mini-line"></div>
                                                <span className="mini-tag mini-tag--green">@team</span>
                                            </div>
                                        </div>

                                        <div className="preview-col">
                                            <span className="preview-col-tag">LISTED</span>
                                            <div className="preview-mini-card">
                                                <div className="mini-line"></div>
                                                <span className="mini-sq mini-sq--green"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Provisioning Loader */}
                    {wsStep === 4 && (
                        <div className="jira-modal jira-modal--loader">
                            <div className="loader-brand-badge">
                                <span>A</span>
                            </div>
                            <h2>Welcome to {activeWorkspace?.name || name}</h2>
                            <div className="jira-progress-track">
                                <div
                                    className="jira-progress-fill"
                                    style={{ width: `${setupProgress}%` }}
                                ></div>
                            </div>
                            <p className="loader-caption">
                                Setting up workspace{" "}
                                <span className="loader-pill">{slug}.amazonmap.ai</span> for
                                Shopify store connection...
                            </p>
                        </div>
                    )}
                </main>
            )}

            {/* =========================================================
                PHASE 2+: STEPPER WIZARD (Shopify -> Amazon -> Complete)
               ========================================================= */}
            {phase !== "workspace" && (
                <main className="wizard-stage">
                    <div className="wizard-shell">
                        {/* Theme-Matched 4-Step Horizontal Stepper */}
                        <div className="wizard-stepper">
                            {WIZARD_STEPS.map((label, idx) => {
                                const stepNum = idx + 1;
                                const activeNum = getWizardStepNumber();
                                const isDone = stepNum < activeNum;
                                const isCurrent = stepNum === activeNum;
                                const isAmazonCurrent = stepNum === 3 && isCurrent;

                                return (
                                    <React.Fragment key={label}>
                                        <div className="w-step-node">
                                            <div
                                                className={`w-step-circle ${
                                                    isDone
                                                        ? "is-done"
                                                        : isAmazonCurrent
                                                        ? "is-current-amazon"
                                                        : isCurrent
                                                        ? "is-current"
                                                        : ""
                                                }`}
                                            >
                                                {isDone ? "✓" : stepNum}
                                            </div>
                                            <span
                                                className={`w-step-label ${
                                                    isCurrent
                                                        ? "is-current-text"
                                                        : isDone
                                                        ? "is-done-text"
                                                        : ""
                                                }`}
                                            >
                                                {label}
                                            </span>
                                        </div>
                                        {stepNum < WIZARD_STEPS.length && (
                                            <div
                                                className={`w-step-connector ${
                                                    isDone ? "is-done" : ""
                                                }`}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* Centered Card */}
                        <div className="wizard-card">
                            {/* STEP 2: SHOPIFY STORE CONNECTION */}
                            {phase === "shopify" && (
                                <>
                                    <h2 className="wizard-card-title">Connect your Shopify Store</h2>
                                    <p className="wizard-card-sub">
                                        Authorize access to your Shopify catalog via Admin GraphQL
                                        API.
                                    </p>

                                    <div className="wizard-inner-box">
                                        {!shopifyStore?.isActive ? (
                                            <form
                                                onSubmit={handleConnectShopify}
                                                className="wizard-inner-form"
                                            >
                                                <div className="wizard-field">
                                                    <label htmlFor="shopDomain">
                                                        Shopify Store Domain
                                                    </label>
                                                    <div className="shopify-domain-input">
                                                        <input
                                                            id="shopDomain"
                                                            type="text"
                                                            placeholder="your-store-name"
                                                            value={shopInput}
                                                            onChange={(e) =>
                                                                setShopInput(
                                                                    e.target.value
                                                                        .toLowerCase()
                                                                        .replace(/\s+/g, "-")
                                                                )
                                                            }
                                                            disabled={isShopifyConnecting}
                                                            autoFocus
                                                        />
                                                        <span className="shopify-domain-suffix">
                                                            .myshopify.com
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="wizard-field">
                                                    <label>Target Workspace</label>
                                                    <input
                                                        type="text"
                                                        className="wizard-readonly-input"
                                                        readOnly
                                                        value={`${
                                                            activeWorkspace?.name || name
                                                        } (${slug}.amazonmap.ai)`}
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="btn-shopify-connect"
                                                    disabled={
                                                        !shopInput.trim() || isShopifyConnecting
                                                    }
                                                >
                                                    <svg
                                                        width="19"
                                                        height="19"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                                        <line x1="3" y1="6" x2="21" y2="6" />
                                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                                    </svg>
                                                    <span>
                                                        {isShopifyConnecting
                                                            ? "Authorizing Shopify Store..."
                                                            : "Connect Shopify Store"}
                                                    </span>
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="store-connected-panel">
                                                <div className="store-connected-left">
                                                    <div className="store-connected-icon">
                                                        <svg
                                                            width="22"
                                                            height="22"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.2"
                                                        >
                                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                                            <line x1="3" y1="6" x2="21" y2="6" />
                                                            <path d="M16 10a4 4 0 0 1-8 0" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4>{shopifyStore.shopDomain}</h4>
                                                        <span className="store-connected-meta">
                                                            ● Connected via Admin OAuth · Active
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-store-disconnect"
                                                    onClick={handleDisconnectShopify}
                                                >
                                                    Disconnect
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* STEP 3: AMAZON SELLER CENTRAL */}
                            {phase === "amazon" && (
                                <>
                                    <h2 className="wizard-card-title">
                                        Connect Amazon Seller Central
                                    </h2>
                                    <p className="wizard-card-sub">
                                        Link your Amazon SP-API to allow automated publishing.
                                    </p>

                                    <div className="wizard-inner-box">
                                        {!amazonStatus.connected ? (
                                            <form
                                                onSubmit={handleConnectAmazon}
                                                className="wizard-inner-form"
                                            >
                                                <div className="wizard-field">
                                                    <label htmlFor="marketplaceId">
                                                        Select Region / Marketplace
                                                    </label>
                                                    <div className="wizard-select-wrap">
                                                        <select
                                                            id="marketplaceId"
                                                            className="wizard-select"
                                                            value={marketplaceId}
                                                            onChange={(e) =>
                                                                setMarketplaceId(e.target.value)
                                                            }
                                                            disabled={isAmazonConnecting}
                                                        >
                                                            {AMAZON_MARKETPLACES.map((mp) => (
                                                                <option key={mp.id} value={mp.id}>
                                                                    {mp.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="wizard-field">
                                                    <label htmlFor="nickname">
                                                        Store Connection Nickname (Optional)
                                                    </label>
                                                    <input
                                                        id="nickname"
                                                        type="text"
                                                        className="wizard-std-input"
                                                        placeholder="e.g., My US Store"
                                                        maxLength={60}
                                                        value={nickname}
                                                        onChange={(e) =>
                                                            setNickname(e.target.value)
                                                        }
                                                        disabled={isAmazonConnecting}
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="btn-amazon-connect"
                                                    disabled={!marketplaceId || isAmazonConnecting}
                                                >
                                                    <svg
                                                        width="19"
                                                        height="19"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                        <line x1="12" y1="22.08" x2="12" y2="12" />
                                                    </svg>
                                                    <span>
                                                        {isAmazonConnecting
                                                            ? "Connecting Amazon SP-API..."
                                                            : "Connect Amazon SP-API"}
                                                    </span>
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="store-connected-panel">
                                                <div className="store-connected-left">
                                                    <div className="store-connected-icon store-connected-icon--amazon">
                                                        <svg
                                                            width="22"
                                                            height="22"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                            <line x1="12" y1="22.08" x2="12" y2="12" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4>
                                                            {amazonStatus.nickname ||
                                                                "Sandbox Store"}
                                                        </h4>
                                                        <span className="store-connected-meta store-connected-meta--amazon">
                                                            ●{" "}
                                                            {getSelectedMarketplaceLabel(
                                                                amazonStatus.marketplaceId
                                                            )}{" "}
                                                            ({amazonStatus.marketplaceId})
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-store-disconnect"
                                                    onClick={handleDisconnectAmazon}
                                                >
                                                    Disconnect
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* STEP 4: COMPLETE */}
                            {phase === "complete" && (
                                <>
                                    <div className="complete-check-circle">✓</div>
                                    <h2 className="wizard-card-title">Workspace Ready!</h2>
                                    <p className="wizard-card-sub">
                                        <strong>{activeWorkspace?.name || name}</strong> is linked
                                        with{" "}
                                        <strong>
                                            {shopifyStore?.shopDomain ||
                                                formatShopDomain(shopInput)}
                                        </strong>{" "}
                                        and{" "}
                                        <strong>
                                            {amazonStatus.nickname || "Sandbox Store"} (
                                            {amazonStatus.marketplaceId})
                                        </strong>
                                        .
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Bottom Bar Outside Card (Theme-Matched Buttons) */}
                        <div className="wizard-bottom-bar">
                            {phase === "shopify" && (
                                <>
                                    <button
                                        type="button"
                                        className="w-nav-btn w-nav-btn--back"
                                        onClick={() => {
                                            setPhase("workspace");
                                            setWsStep(2);
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="w-nav-btn w-nav-btn--shopify"
                                        disabled={!shopifyStore?.isActive}
                                        onClick={() => setPhase("amazon")}
                                    >
                                        Continue
                                    </button>
                                </>
                            )}

                            {phase === "amazon" && (
                                <>
                                    <button
                                        type="button"
                                        className="w-nav-btn w-nav-btn--back"
                                        onClick={() => setPhase("shopify")}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="w-nav-btn w-nav-btn--amazon"
                                        disabled={!amazonStatus.connected}
                                        onClick={() => setPhase("complete")}
                                    >
                                        Continue
                                    </button>
                                </>
                            )}

                            {phase === "complete" && (
                                <button
                                    type="button"
                                    className="w-nav-btn w-nav-btn--shopify w-nav-btn--full-center"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    Go to Dashboard →
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
}