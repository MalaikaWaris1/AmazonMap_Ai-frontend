// ==========================================
// AMAZON SP-API STORE SERVICE (Mock + Backend Ready)
// ==========================================
const API_BASE_URL =
    import.meta.env.VITE_AMAZON_API_URL || "http://localhost:5000/api/v1/amazon";

// Demo ke liye true rakhein; jab backend connect karein toh false kar dein
const USE_MOCK_AMAZON = true;

const amzDelay = (ms = 850) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_AMAZON_KEY = "amazonmap_amazon_store";

// Official Amazon Marketplace IDs matching backend AmazonStore.js
export const AMAZON_MARKETPLACES = [
    {
        id: "ATVPDKIKX0DER",
        label: "North America (US, CA, MX)",
        regionCode: "US",
        currency: "USD",
    },
    {
        id: "A2EUQ1WTGCTBG2",
        label: "Canada (Amazon.ca)",
        regionCode: "CA",
        currency: "CAD",
    },
    {
        id: "A1F83G8C2ARO7P",
        label: "United Kingdom (Amazon.co.uk)",
        regionCode: "UK",
        currency: "GBP",
    },
    {
        id: "A1PA6795UKMFR9",
        label: "Europe — Germany (Amazon.de)",
        regionCode: "DE",
        currency: "EUR",
    },
    {
        id: "A2VIGQ35RCS4UG",
        label: "Middle East — UAE (Amazon.ae)",
        regionCode: "AE",
        currency: "AED",
    },
    {
        id: "A21TJRUUN4KGV",
        label: "India (Amazon.in)",
        regionCode: "IN",
        currency: "INR",
    },
];

// 1. CONNECT AMAZON SANDBOX (Matches backend: POST /connect with { workspaceId, marketplaceId, nickname })
export const connectAmazonSandboxApi = async (
    { workspaceId, marketplaceId, nickname },
    accessToken
) => {
    if (!workspaceId || !marketplaceId) {
        throw new Error("Workspace ID aur Marketplace ID required hain.");
    }

    const validMarketplace = AMAZON_MARKETPLACES.some((m) => m.id === marketplaceId);
    if (!validMarketplace) {
        throw new Error("Invalid Amazon Marketplace ID selected.");
    }

    const cleanNickname = nickname?.trim() || "Sandbox Store";
    if (cleanNickname.length > 60) {
        throw new Error("Store nickname 60 characters se kam hona chahiye.");
    }

    if (USE_MOCK_AMAZON) {
        await amzDelay(950);

        const connectedStore = {
            _id: `amz_${Date.now()}`,
            workspaceId,
            marketplaceId,
            nickname: cleanNickname,
            isActive: true,
            environment: "sandbox",
            updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(MOCK_AMAZON_KEY, JSON.stringify(connectedStore));

        return {
            message: "Sandbox environment successfully connected!",
            store: connectedStore,
        };
    }

    try {
        const res = await fetch(`${API_BASE_URL}/connect`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            credentials: "include",
            body: JSON.stringify({
                workspaceId,
                marketplaceId,
                nickname: nickname?.trim() || undefined,
            }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Amazon SP-API connection failed.");
        }
        return data;
    } catch (error) {
        if (error.name === "TypeError") {
            throw new Error("Server se rabta nahi ho saka. Backend server check karein.");
        }
        throw error;
    }
};

// 2. GET AMAZON CONNECTION STATUS (Matches backend: GET /status?workspaceId=...)
export const getAmazonStatusApi = async ({ workspaceId }, accessToken) => {
    if (!workspaceId) {
        throw new Error("Workspace ID required");
    }

    if (USE_MOCK_AMAZON) {
        await amzDelay(250);
        const saved = localStorage.getItem(MOCK_AMAZON_KEY);
        if (!saved) return { connected: false };

        const parsed = JSON.parse(saved);
        if (parsed.workspaceId !== workspaceId || !parsed.isActive) {
            return { connected: false };
        }

        return {
            connected: true,
            marketplaceId: parsed.marketplaceId,
            nickname: parsed.nickname,
            environment: parsed.environment || "sandbox",
        };
    }

    try {
        const res = await fetch(
            `${API_BASE_URL}/status?workspaceId=${encodeURIComponent(workspaceId)}`,
            {
                method: "GET",
                headers: {
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                credentials: "include",
            }
        );

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Unable to verify Amazon connection status.");
        }
        return data;
    } catch (error) {
        if (error.name === "TypeError") {
            throw new Error("Amazon status check failed: Network error.");
        }
        throw error;
    }
};

// 3. DISCONNECT LOCAL SESSION (Allows switching marketplace/nickname in wizard)
export const disconnectAmazonStoreApi = async () => {
    await amzDelay(250);
    localStorage.removeItem(MOCK_AMAZON_KEY);
    return { connected: false };
};