import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { LayoutDashboard, LogIn, ShoppingBag, Sparkles, ClipboardCheck, Upload, Wand2 } from "lucide-react";

export const STEPS = [
  { path: "/auth", label: "Authentication", short: "Sign in & onboarding", icon: LogIn },
  { path: "", label: "Shopify & Amazon Accounts", short: "Already connected", icon: ShoppingBag },
  { path: "/dashboard", label: "Command Center", short: "Dashboard overview", icon: LayoutDashboard },
  { path: "/import", label: "Shopify Import", short: "Connect & fetch", icon: ShoppingBag },
  { path: "/clean", label: "Data Health", short: "Cleaning dashboard", icon: Wand2 },
  { path: "/mapping", label: "AI + Rule Mapping", short: "Field mapping engine", icon: Sparkles },
  { path: "/review", label: "Seller Review", short: "Validation queue", icon: ClipboardCheck },
  { path: "/publish", label: "Publish & Repair", short: "Amazon SP-API", icon: Upload },
];

const PipelineContext = createContext(null);

export function PipelineProvider({ children }) {
  const [unlocked, setUnlocked] = useState(2);
  const [completed, setCompleted] = useState([0, 1]);

  const unlock = useCallback((index) => {
    setUnlocked((u) => Math.max(u, index));
    setCompleted((c) => {
      const next = new Set(c);
      for (let i = 0; i < index; i += 1) next.add(i);
      return next.size === c.length ? c : [...next];
    });
  }, []);

  const value = useMemo(() => ({ unlocked, completed, unlock }), [unlocked, completed, unlock]);
  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>;
}

export function usePipeline() {
  return useContext(PipelineContext);
}
