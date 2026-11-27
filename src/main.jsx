import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { WorkspaceProvider } from "./context/WorkspaceContext.jsx";
import { ImportProvider } from "./context/ImportContext.jsx";
import { DataCleaningProvider } from "./context/DataCleaningContext.jsx";
import App from "./app";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <WorkspaceProvider>
        <ImportProvider>
          <DataCleaningProvider>
            <App />
          </DataCleaningProvider>
        </ImportProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </StrictMode>
);