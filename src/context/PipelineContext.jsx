import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  LayoutDashboard,
  LogIn,
  Layers,
  ShoppingBag,
  Wand2,
  Sparkles,
  SlidersHorizontal,
  ShieldAlert,
  ClipboardCheck,
  Upload,
} from "lucide-react";

export const STEPS = [
  // Phase 1: Foundation & Store Connections
  {
    path: "/auth",
    label: "Authentication",
    short: "Sign in & JWT account",
    icon: LogIn,
  },
  {
    path: "/dashboard/settings",
    label: "Workspace & Stores",
    short: "Shopify & Amazon linked",
    icon: Layers,
  },

  // Central Operations Overview
  {
    path: "/dashboard",
    label: "Command Center",
    short: "Dashboard overview",
    icon: LayoutDashboard,
  },

  // Phase 2: Data Ingestion & Normalization
  {
    path: "/import",
    label: "Shopify Import",
    short: "Fetch raw catalog",
    icon: ShoppingBag,
  },
  {
    path: "/clean",
    label: "Data Cleaning & Audit",
    short: "HTML strip & normalize",
    icon: Wand2,
  },

  // Phase 3: Intelligence & Deterministic Transformation
  {
    path: "/mapping",
    label: "AI-Based Mapping",
    short: "Qwen2.5 SP-API mapping",
    icon: Sparkles,
  },
  {
    path: "/transform",
    label: "Rule Transformation",
    short: "Ruleset & unit conversion",
    icon: SlidersHorizontal,
  },

  // Phase 4: Quality Gate, Human Approval & Publishing
  {
    path: "/validation",
    label: "Validation Gate",
    short: "Schema & compliance check",
    icon: ShieldAlert,
  },
  {
    path: "/review",
    label: "Seller Review",
    short: "Human review & approval",
    icon: ClipboardCheck,
  },
  {
    path: "/publish",
    label: "Amazon Publishing",
    short: "SP-API submit & status",
    icon: Upload,
  },
];

const PipelineContext = createContext(null);

export function PipelineProvider({ children }) {
  // Index 0 (Auth) & Index 1 (Workspace & Stores) completed; Index 2 (Command Center) active
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

  const value = useMemo(
    () => ({ unlocked, completed, unlock }),
    [unlocked, completed, unlock]
  );

  return (
    <PipelineContext.Provider value={value}>
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline() {
  return useContext(PipelineContext);
}