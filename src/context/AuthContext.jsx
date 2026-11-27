import { createContext, useContext, useState } from "react";
import {
    registerUserApi,
    loginUserApi,
    googleLoginApi,
    forgotPasswordApi,
    resetPasswordApi,
    logoutUserApi,
} from "../api/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("amazonmap_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [accessToken, setAccessToken] = useState(() => {
        return localStorage.getItem("amazonmap_accessToken") || null;
    });

    const [loading, setLoading] = useState(false);
    const [statusBanner, setStatusBanner] = useState(null); // { type: "success" | "error", text: string }

    const saveSession = (userData, token) => {
        setUser(userData);
        setAccessToken(token);
        localStorage.setItem("amazonmap_user", JSON.stringify(userData));
        localStorage.setItem("amazonmap_accessToken", token);
    };

    const register = async ({ fullName, email, password }) => {
        setLoading(true);
        setStatusBanner(null);
        try {
            const response = await registerUserApi({ fullName, email, password });
            setStatusBanner({
                type: "success",
                text: "Account created successfully! Please log in.",
            });
            return response;
        } finally {
            setLoading(false);
        }
    };

    const login = async ({ email, password }) => {
        setLoading(true);
        setStatusBanner(null);
        try {
            const response = await loginUserApi({ email, password });
            saveSession(response.user, response.accessToken);
            return response;
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async (googleToken) => {
        setLoading(true);
        setStatusBanner(null);
        try {
            const response = await googleLoginApi(googleToken);
            saveSession(response.user, response.accessToken);
            return response;
        } finally {
            setLoading(false);
        }
    };

    const forgotPassword = async ({ email }) => {
        setLoading(true);
        setStatusBanner(null);
        try {
            const response = await forgotPasswordApi({ email });
            setStatusBanner({
                type: "success",
                text: response.message || "Password reset link sent to email.",
            });
            return response;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async ({ token, newPassword }) => {
        setLoading(true);
        setStatusBanner(null);
        try {
            const response = await resetPasswordApi({ token, newPassword });
            setStatusBanner({
                type: "success",
                text: response.message || "Password reset successfully. You can now login.",
            });
            return response;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await logoutUserApi(accessToken);
        } catch {
            // Even if network fails, clear local session
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem("amazonmap_user");
            localStorage.removeItem("amazonmap_accessToken");
            setStatusBanner({
                type: "success",
                text: "You have successfully logged out.",
            });
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated: Boolean(user && accessToken),
                loading,
                statusBanner,
                setStatusBanner,
                register,
                login,
                loginWithGoogle,
                forgotPassword,
                resetPassword,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }
    return context;
};