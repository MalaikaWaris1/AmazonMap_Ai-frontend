import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import brandLogo from "../assets/logo.jpeg"; // Apni logo file src/assets/logo.png mein rakhein
import "./AuthPage.css";

// Eye / Eye-Off Icon Component
const EyeToggleIcon = ({ visible }) =>
    visible ? (
        // Password VISIBLE hai -> Open Eye
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        // Password HIDDEN hai -> Slashed Eye
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );

// Password Strength Evaluation Helper
const evaluatePassword = (pwd = "") => {
    const rules = [
        {
            id: "length",
            label: "8 to 64 characters long",
            passed: pwd.length >= 8 && pwd.length <= 64,
        },
        {
            id: "uppercase",
            label: "At least 1 uppercase letter (A–Z)",
            passed: /[A-Z]/.test(pwd),
        },
        {
            id: "lowercase",
            label: "At least 1 lowercase letter (a–z)",
            passed: /[a-z]/.test(pwd),
        },
        {
            id: "number",
            label: "At least 1 number (0–9)",
            passed: /[0-9]/.test(pwd),
        },
        {
            id: "special",
            label: "At least 1 special character (!@#$%^&*)",
            passed: /[^A-Za-z0-9]/.test(pwd),
        },
    ];

    const passedCount = rules.filter((r) => r.passed).length;
    const isStrong = passedCount === rules.length;

    let strengthLabel = "Weak";
    let strengthLevel = "weak";
    if (passedCount >= 5) {
        strengthLabel = "Strong";
        strengthLevel = "strong";
    } else if (passedCount >= 3) {
        strengthLabel = "Medium";
        strengthLevel = "medium";
    }

    return { rules, passedCount, isStrong, strengthLabel, strengthLevel };
};

// Live Password Strength & Checklist Component
const PasswordRequirements = ({ passwordValue }) => {
    const { rules, passedCount, strengthLabel, strengthLevel } = evaluatePassword(passwordValue);

    return (
        <div className="pwd-strength-box">
            <div className="pwd-strength-header">
                <span className="pwd-strength-title">
                    Password strength:{" "}
                    <strong className={`pwd-level-text pwd-level-text--${strengthLevel}`}>
                        {passwordValue ? strengthLabel : "Not entered"}
                    </strong>
                </span>
                <span className="pwd-char-count">{passwordValue.length}/64</span>
            </div>

            <div className="pwd-meter-bars">
                {[1, 2, 3, 4, 5].map((step) => (
                    <span
                        key={step}
                        className={`pwd-meter-seg ${
                            passedCount >= step ? `pwd-meter-seg--${strengthLevel}` : ""
                        }`}
                    />
                ))}
            </div>

            <ul className="pwd-rules-list">
                {rules.map((rule) => (
                    <li
                        key={rule.id}
                        className={`pwd-rule-item ${rule.passed ? "pwd-rule-item--passed" : ""}`}
                    >
                        <span className="pwd-rule-icon">{rule.passed ? "✓" : "•"}</span>
                        <span>{rule.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const AuthPage = () => {
    const navigate = useNavigate();
    const { token: urlResetToken } = useParams();

    const {
        login,
        register,
        loginWithGoogle,
        forgotPassword,
        resetPassword,
        loading,
        statusBanner,
        setStatusBanner,
    } = useAuth();

    const [mode, setMode] = useState(urlResetToken ? "reset" : "login");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        newPassword: "",
        token: urlResetToken || "",
    });

    useEffect(() => {
        if (urlResetToken) {
            setMode("reset");
            setFormData((prev) => ({ ...prev, token: urlResetToken }));
        }
    }, [urlResetToken]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const switchMode = (newMode) => {
        setStatusBanner(null);
        setShowPassword(false);
        setMode(newMode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusBanner(null);

        try {
            if (mode === "login") {
                await login({ email: formData.email, password: formData.password });
                navigate("/dashboard");
            } else if (mode === "register") {
                if (!evaluatePassword(formData.password).isStrong) {
                    throw new Error("Please meet all password requirements before creating an account.");
                }
                await register({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                });
                setFormData((prev) => ({ ...prev, password: "" }));
                setMode("login");
            } else if (mode === "forgot") {
                const res = await forgotPassword({ email: formData.email });
                if (res?.demoResetToken) {
                    setFormData((prev) => ({ ...prev, token: res.demoResetToken }));
                }
            } else if (mode === "reset") {
                if (!evaluatePassword(formData.newPassword).isStrong) {
                    throw new Error("New password must meet all password strength requirements.");
                }
                await resetPassword({
                    token: formData.token,
                    newPassword: formData.newPassword,
                });
                setFormData((prev) => ({ ...prev, newPassword: "", password: "" }));
                setMode("login");
            }
        } catch (err) {
            setStatusBanner({
                type: "error",
                text: err.message || "Something went wrong. Please try again.",
            });
        }
    };

    const handleGoogleContinue = async () => {
        setStatusBanner(null);
        try {
            await loginWithGoogle();
            navigate("/onboarding");
        } catch (err) {
            setStatusBanner({
                type: "error",
                text: err.message || "Google sign-in failed.",
            });
        }
    };

    const isFormValid = () => {
        if (mode === "login") return formData.email.trim() && formData.password.trim();
        if (mode === "register") {
            return (
                formData.fullName.trim() &&
                formData.email.trim() &&
                evaluatePassword(formData.password).isStrong
            );
        }
        if (mode === "forgot") return formData.email.trim();
        if (mode === "reset") {
            return formData.token.trim() && evaluatePassword(formData.newPassword).isStrong;
        }
        return false;
    };

    return (
        <div className="auth-layout">
            {/* LEFT PANEL */}
            <div className="auth-left-panel">
                <div className="auth-form-container">
                    {/* Custom Brand Logo Image */}
                    <div className="auth-brand">
                        <img
                            src={brandLogo}
                            alt="AmazonMap AI"
                            className="auth-brand-logo"
                        />
                    </div>

                    {/* Headings */}
                    {mode === "login" && (
                        <>
                            <h1 className="auth-title">Log in to your account</h1>
                            <p className="auth-subtitle">
                                Don&apos;t have an account?{" "}
                                <button
                                    type="button"
                                    className="auth-link-btn"
                                    onClick={() => switchMode("register")}
                                >
                                    Sign Up
                                </button>
                            </p>
                        </>
                    )}

                    {mode === "register" && (
                        <>
                            <h1 className="auth-title">Create your account</h1>
                            <p className="auth-subtitle">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    className="auth-link-btn"
                                    onClick={() => switchMode("login")}
                                >
                                    Log In
                                </button>
                            </p>
                        </>
                    )}

                    {mode === "forgot" && (
                        <>
                            <h1 className="auth-title">Reset your password</h1>
                            <p className="auth-subtitle">
                                Remembered your password?{" "}
                                <button
                                    type="button"
                                    className="auth-link-btn"
                                    onClick={() => switchMode("login")}
                                >
                                    Back to Log In
                                </button>
                            </p>
                        </>
                    )}

                    {mode === "reset" && (
                        <>
                            <h1 className="auth-title">Set a new password</h1>
                            <p className="auth-subtitle">
                                Enter your reset token and choose a new password.
                            </p>
                        </>
                    )}

                    {/* Status Notification Banner */}
                    {statusBanner && (
                        <div className={`auth-banner auth-banner--${statusBanner.type}`}>
                            <span className="auth-banner-icon">
                                {statusBanner.type === "success" ? "✓" : "!"}
                            </span>
                            <span>{statusBanner.text}</span>
                        </div>
                    )}

                    {/* Google OAuth Button */}
                    {(mode === "login" || mode === "register") && (
                        <>
                            <button
                                type="button"
                                className="auth-google-btn"
                                onClick={handleGoogleContinue}
                                disabled={loading}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                                    />
                                </svg>
                                <span>Google</span>
                            </button>

                            <div className="auth-divider">
                                <span>Or with email and password</span>
                            </div>
                        </>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        {mode === "register" && (
                            <div className="auth-field">
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    name="fullName"
                                    placeholder="e.g. Malaika Waris"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        {(mode === "login" || mode === "register" || mode === "forgot") && (
                            <div className="auth-field">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="seller@store.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        {(mode === "login" || mode === "register") && (
                            <div className="auth-field">
                                <div className="auth-label-row">
                                    <label htmlFor="password">Password</label>
                                    {mode === "login" && (
                                        <button
                                            type="button"
                                            className="auth-forgot-link"
                                            onClick={() => switchMode("forgot")}
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="auth-password-wrap">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        maxLength={64}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-eye-btn"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <EyeToggleIcon visible={showPassword} />
                                    </button>
                                </div>

                                {mode === "register" && (
                                    <PasswordRequirements passwordValue={formData.password} />
                                )}
                            </div>
                        )}

                        {mode === "reset" && (
                            <>
                                <div className="auth-field">
                                    <label htmlFor="token">Reset Token</label>
                                    <input
                                        id="token"
                                        type="text"
                                        name="token"
                                        placeholder="Paste token from email"
                                        value={formData.token}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="auth-field">
                                    <label htmlFor="newPassword">New Password</label>
                                    <div className="auth-password-wrap">
                                        <input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            name="newPassword"
                                            maxLength={64}
                                            placeholder="Enter new password"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-eye-btn"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            <EyeToggleIcon visible={showPassword} />
                                        </button>
                                    </div>

                                    <PasswordRequirements passwordValue={formData.newPassword} />
                                </div>
                            </>
                        )}

                        {mode === "forgot" && formData.token && (
                            <p className="auth-demo-hint">
                                Demo mode:{" "}
                                <button
                                    type="button"
                                    className="auth-link-btn"
                                    onClick={() => switchMode("reset")}
                                >
                                    Open Reset Password Form →
                                </button>
                            </p>
                        )}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={!isFormValid() || loading}
                        >
                            {loading
                                ? "Please wait..."
                                : mode === "login"
                                ? "Log In"
                                : mode === "register"
                                ? "Create Account"
                                : mode === "forgot"
                                ? "Send Reset Link"
                                : "Update Password"}
                        </button>
                    </form>

                    {mode === "login" && (
                        <p className="auth-demo-footer">
                            Demo Login: <strong>seller@amazonmap.ai</strong> / <strong>Password123</strong>
                        </p>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Clean Enterprise Split Screen */}
            <div className="auth-right-panel">
                <div className="auth-hero-content">
                    <h2 className="auth-hero-heading">
                        Sync your Shopify catalog to Amazon
                    </h2>
                    <p className="auth-hero-text">
                        Import store products, clean attributes, validate category requirements,
                        and publish directly to Amazon Seller Central.
                    </p>
                    <button
                        type="button"
                        className="auth-hero-link"
                        onClick={() => switchMode("register")}
                    >
                        Create a seller account <span>→</span>
                    </button>
                </div>

                {/* Clean Geometric Accent Grid (Positioned away from text) */}
                <div className="auth-geometric-grid" aria-hidden="true">
                    <div className="geo-tile geo-tile--deep"></div>
                    <div className="geo-tile geo-tile--forest"></div>
                    <div className="geo-tile geo-tile--lime"></div>
                    <div className="geo-tile geo-tile--deep"></div>
                    <div className="geo-tile geo-tile--emerald"></div>
                    <div className="geo-tile geo-tile--forest"></div>
                    <div className="geo-tile geo-tile--forest"></div>
                    <div className="geo-tile geo-tile--amber"></div>
                    <div className="geo-tile geo-tile--emerald"></div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;