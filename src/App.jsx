import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';

// --- PROVIDERS ---
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { PipelineProvider } from "./context/PipelineContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";

// --- PUBLIC WEBSITE COMPONENTS ---
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import HowItWorksPage from './pages/working/HowItWorksPage';
import AuthPage from './pages/AuthPage';
import OnboardingWizard from './pages/OnboardingWizard';

// --- DASHBOARD PAGES ---
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import ImportPage from "./pages/ImportPage.jsx";
import CleanPage from "./pages/CleanPage.jsx";
import MappingPage from "./pages/MappingPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import PublishPage from "./pages/PublishPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

// Root Wrapper: Saare routes ko AuthProvider aur PipelineProvider provide karega
const RootProviders = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <PipelineProvider>
          <Outlet />
        </PipelineProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

// Route Guard: Bina login ke Dashboard/Onboarding block karega
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    element: <RootProviders />,
    children: [
      // 1. Public Website Routes
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { path: "", element: <Home /> },
          { path: "how-it-works", element: <HowItWorksPage /> },
        ],
      },

      // 2. Authentication Routes
      {
        path: "/auth",
        element: <AuthPage />,
      },
      {
        path: "/reset-password/:token",
        element: <AuthPage />,
      },

      // 3. Onboarding Route (Protected)
      {
        path: "/onboarding",
        element: (
          <ProtectedRoute>
            <OnboardingWizard />
          </ProtectedRoute>
        ),
      },

      // 4. Dashboard Routes (Protected)
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/import",
        element: (
          <ProtectedRoute>
            <ImportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/clean",
        element: (
          <ProtectedRoute>
            <CleanPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/mapping",
        element: (
          <ProtectedRoute>
            <MappingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/review",
        element: (
          <ProtectedRoute>
            <ReviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/publish",
        element: (
          <ProtectedRoute>
            <PublishPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;