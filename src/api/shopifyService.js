// ==========================================
// SHOPIFY STORE API SERVICE (Mock + OAuth Ready)
// ==========================================
const API_BASE_URL =
    import.meta.env.VITE_SHOPIFY_API_URL || "http://localhost:5000/api/v1/shopify";

// Demo ke liye true rakhein; jab backend connect karein toh false kar dein
const USE_MOCK_SHOPIFY = true;

const shopifyDelay = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_STORE_KEY = "amazonmap_shopify_store";

// Domain formatter matching backend authShopify logic
export const formatShopDomain = (rawShop = "") => {
    const cleaned = rawShop
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "");

    if (!cleaned) return "";
    return cleaned.includes(".myshopify.com") ? cleaned : `${cleaned}.myshopify.com`;
};

// 1. CONNECT SHOPIFY STORE (Matches backend: GET /auth?shop=...&workspaceId=...)
export const connectShopifyStoreApi = async ({ shop, workspaceId }) => {
    if (!workspaceId) {
        throw new Error("Workspace ID zaroori hai. Pehle workspace create karein.");
    }

    const shopDomain = formatShopDomain(shop);
    const slugPart = shopDomain.replace(".myshopify.com", "");

    if (!slugPart || !/^[a-z0-9][a-z0-9-]{1,50}$/.test(slugPart)) {
        throw new Error("Valid Shopify store domain enter karein (e.g. nova-apparel).");
    }

    if (USE_MOCK_SHOPIFY) {
        await shopifyDelay(1000);

        const connectedStore = {
            _id: `store_${Date.now()}`,
            workspaceId,
            shopDomain,
            isActive: true,
            connectedAt: new Date().toISOString(),
        };

        localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(connectedStore));
        return {
            mode: "mock",
            message: "Shopify store connected successfully",
            store: connectedStore,
        };
    }

    // Real Backend OAuth Redirect (authShopify controller executes res.redirect(installUrl))
    const authUrl = `${API_BASE_URL}/auth?shop=${encodeURIComponent(
        shopDomain
    )}&workspaceId=${encodeURIComponent(workspaceId)}`;

    window.location.href = authUrl;
    return { mode: "redirect" };
};

// 2. GET SAVED / ACTIVE STORE FOR WORKSPACE
export const getConnectedShopifyStore = (workspaceId) => {
    const saved = localStorage.getItem(MOCK_STORE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (workspaceId && parsed.workspaceId && parsed.workspaceId !== workspaceId) {
        return null;
    }
    return parsed;
};

// 3. DISCONNECT STORE (Local state reset for re-connecting)
export const disconnectShopifyStoreApi = async () => {
    await shopifyDelay(300);
    localStorage.removeItem(MOCK_STORE_KEY);
    return { message: "Shopify store disconnected" };
};