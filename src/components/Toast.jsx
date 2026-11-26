import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((title, description) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, description }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <CheckCircle2 size={18} className="text-success" />
            <div>
              <p className="toast-title">{t.title}</p>
              {t.description && <p className="toast-desc">{t.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
