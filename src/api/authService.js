// ==========================================
// AUTHENTICATION API (Mock + Backend Ready)
// ==========================================
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1/users";

// Demo ke liye true rakhein; jab backend connect karein toh false kar dein
const USE_MOCK_AUTH = true;

const authDelay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// Dummy user database (Demo ke liye)
const MOCK_USERS_KEY = "amazonmap_mock_users";

const getMockUsers = () => {
    const saved = localStorage.getItem(MOCK_USERS_KEY);
    if (saved) return JSON.parse(saved);
    const defaultUsers = [
        {
            _id: "674a1b2c3d4e5f6a7b8c9d01",
            fullName: "Malaika Waris",
            email: "seller@amazonmap.ai",
            password: "Password123",
            createdAt: new Date().toISOString(),
        },
    ];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
};

// 1. REGISTER USER (Matches backend: { fullName, email, password })
export const registerUserApi = async ({ fullName, email, password }) => {
    if (USE_MOCK_AUTH) {
        await authDelay();
        const users = getMockUsers();
        const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            throw new Error("User with email already exists");
        }

        const newUser = {
            _id: `usr_${Date.now()}`,
            fullName,
            email: email.toLowerCase(),
            password,
            createdAt: new Date().toISOString(),
        };
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([...users, newUser]));

        const { password: _, ...safeUser } = newUser;
        return { message: "User registered successfully", user: safeUser };
    }

    const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data;
};

// 2. LOGIN USER (Matches backend: { email, password } -> { user, accessToken })
export const loginUserApi = async ({ email, password }) => {
    if (USE_MOCK_AUTH) {
        await authDelay();
        const users = getMockUsers();
        const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (!foundUser) {
            throw new Error("User does not exist");
        }
        if (foundUser.password && foundUser.password !== password) {
            throw new Error("Invalid credentials");
        }

        const { password: _, ...loggedInUser } = foundUser;
        return {
            message: "User logged in successfully",
            user: loggedInUser,
            accessToken: `mock_jwt_token_${Date.now()}`,
        };
    }

    const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data;
};

// 3. CONTINUE WITH GOOGLE (Matches backend: { token } -> { user, accessToken })
export const googleLoginApi = async (googleToken = "mock_google_id_token") => {
    if (USE_MOCK_AUTH) {
        await authDelay(700);
        const googleUser = {
            _id: "674a1b2c3d4e5f6a7b8c9d99",
            fullName: "Malaika Waris",
            email: "malaika.seller@gmail.com",
            googleId: "google_oauth_1092837465",
        };
        return {
            message: "Google login successful",
            user: googleUser,
            accessToken: `mock_google_jwt_${Date.now()}`,
        };
    }

    const res = await fetch(`${API_BASE_URL}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: googleToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Google login failed");
    return data;
};

// 4. FORGOT PASSWORD (Matches backend: { email })
export const forgotPasswordApi = async ({ email }) => {
    if (USE_MOCK_AUTH) {
        await authDelay();
        const users = getMockUsers();
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!found) {
            throw new Error("User not found with this email");
        }
        return {
            message: "Password reset link sent to email",
            demoResetToken: "demo-reset-token-123",
        };
    }

    const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not send reset link");
    return data;
};

// 5. RESET PASSWORD (Matches backend: PUT /reset-password/:token with { newPassword })
export const resetPasswordApi = async ({ token, newPassword }) => {
    if (USE_MOCK_AUTH) {
        await authDelay();
        if (!token) throw new Error("Invalid or expired reset token");
        return { message: "Password reset successfully. You can now login." };
    }

    const res = await fetch(`${API_BASE_URL}/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Password reset failed");
    return data;
};

// 6. LOGOUT USER (Matches backend: POST /logout)
export const logoutUserApi = async (accessToken) => {
    if (USE_MOCK_AUTH) {
        await authDelay(300);
        return { message: "User logged out successfully" };
    }

    const res = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Logout failed");
    return data;
};