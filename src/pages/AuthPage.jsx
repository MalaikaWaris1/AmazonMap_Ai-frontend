import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { apiService } from "../api/apiService.js";
import { usePipeline } from "../context/PipelineContext.jsx";


export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("ali@northwind-supply.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { unlock } = usePipeline();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await apiService.login(email);
    unlock(2);
    navigate("/onboarding");
  };

  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="row" style={{ gap: 10 }}>
          <div className="brand-icon"><ShieldCheck size={20} /></div>
          <span className="font-medium">AmazonMapAI</span>
        </div>
        <div className="auth-copy">
          <h2>Turn your Shopify catalog into Amazon-ready listings.</h2>
          <p className="lead">
            A guided pipeline: import, clean, map with AI and rules, review, publish — and repair
            rejections automatically.
          </p>
          <ul className="auth-list">
            {[
              "AI + Rule Engine field mapping with confidence scores",
              "Validation queue that catches missing Amazon attributes",
              "Automatic error repair loop for SP-API rejections",
            ].map((item) => (
              <li key={item}><Check size={16} style={{ marginTop: 2, flexShrink: 0 }} />{item}</li>
            ))}
          </ul>
          <div className="auth-stats">
            <div className="auth-stat"><b>1,248</b><span>Products synced</span></div>
            <div className="auth-stat"><b>98.2%</b><span>Mapping accuracy</span></div>
          </div>
        </div>
        <p className="auth-note">Demo environment — all data is simulated.</p>
        <Sparkles className="auth-deco" size={288} style={{ right: -40, top: 96 }} />
        <BarChart3 className="auth-deco" size={256} style={{ bottom: -48, right: 80 }} />
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form">
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-muted">
            {mode === "login" ? "Sign in to continue your sync pipeline." : "Start syncing your Shopify catalog in minutes."}
          </p>
          <form onSubmit={submit}>
            {mode === "signup" && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" className="input" placeholder="Ali Khan" />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Work email</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading && <Loader2 size={16} className="spin" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
          <div className="or"><span />OR<span /></div>
          <button className="btn btn-outline btn-lg btn-block" onClick={submit}>Continue with Google</button>
          <p className="mt-4 text-muted" style={{ textAlign: "center", marginTop: 32 }}>
            {mode === "login" ? "New to AmazonMapAI?" : "Already have an account?"}{" "}
            <button type="button" className="link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
