// ==========================================
// WORKSPACE API SERVICE (Mock + Backend Ready)
// ==========================================
const API_BASE_URL = import.meta.env.VITE_WORKSPACE_API_URL || "http://localhost:5000/api/v1/workspaces";

// Demo ke liye true rakhein; jab backend connect karein toh false kar dein
const USE_MOCK_WORKSPACE = true;

const wsDelay = (ms = 550) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_WORKSPACES_KEY = "amazonmap_mock_workspaces";

const getStoredMockWorkspaces = () => {
    const saved = localStorage.getItem(MOCK_WORKSPACES_KEY);
    if (saved) return JSON.parse(saved);
    return [
        {
            _id: "ws_default_001",
            name: "Demo Store",
            slug: "demo-store",
            owner: "674a1b2c3d4e5f6a7b8c9d01",
            inviteToken: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
            members: [{ user: "674a1b2c3d4e5f6a7b8c9d01", role: "admin" }],
        },
    ];
};

// 1. CREATE WORKSPACE (Matches backend: POST /create with { name, slug })
export const createWorkspaceApi = async ({ name, slug }, accessToken) => {
    if (USE_MOCK_WORKSPACE) {
        await wsDelay();
        if (!name?.trim() || !slug?.trim()) {
            throw new Error("Name and slug are required");
        }

        const cleanSlug = slug.toLowerCase().trim();
        const existingList = getStoredMockWorkspaces();
        const isTaken = existingList.some((w) => w.slug === cleanSlug);

        if (isTaken) {
            throw new Error("This Workspace URL is already taken.");
        }

        const inviteToken = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
        const newWorkspace = {
            _id: `ws_${Date.now()}`,
            name: name.trim(),
            slug: cleanSlug,
            owner: "674a1b2c3d4e5f6a7b8c9d01",
            inviteToken,
            members: [{ user: "674a1b2c3d4e5f6a7b8c9d01", role: "admin" }],
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem(MOCK_WORKSPACES_KEY, JSON.stringify([...existingList, newWorkspace]));

        return {
            message: "Workspace created successfully",
            workspace: newWorkspace,
            inviteLink: `${window.location.origin}/join/${newWorkspace.slug}?token=${inviteToken}`,
        };
    }

    const res = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ name, slug }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create workspace");
    return data;
};

// 2. INVITE MEMBER BY EMAIL (Matches backend: POST /invite with { workspaceId, email })
export const inviteMemberApi = async ({ workspaceId, email }, accessToken) => {
    if (USE_MOCK_WORKSPACE) {
        await wsDelay(450);
        if (!email?.trim() || !email.includes("@")) {
            throw new Error("Please enter a valid teammate email address.");
        }
        return {
            message: `Invitation email sent successfully to ${email}`,
        };
    }

    const res = await fetch(`${API_BASE_URL}/invite`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ workspaceId, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Email couldn't be sent. Please try again.");
    return data;
};

// 3. JOIN WORKSPACE (Matches backend: GET /join/:slug?token=...)
export const joinWorkspaceApi = async ({ slug, token }, accessToken) => {
    if (USE_MOCK_WORKSPACE) {
        await wsDelay(400);
        const list = getStoredMockWorkspaces();
        const found = list.find((w) => w.slug === slug);
        if (!found) throw new Error("Invalid invite link or workspace does not exist");
        return { message: "Successfully joined the workspace!", workspace: found };
    }

    const res = await fetch(`${API_BASE_URL}/join/${encodeURIComponent(slug)}?token=${encodeURIComponent(token)}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to join workspace");
    return data;
};