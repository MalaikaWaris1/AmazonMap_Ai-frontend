import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// --- LOVABLE PROVIDERS ---
import { PipelineProvider } from "./context/PipelineContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";

// --- PUBLIC WEBSITE COMPONENTS (Inke paas public header & footer rahega) ---
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import HowItWorksPage from './pages/working/HowItWorksPage'; 
import AuthPage from './pages/AuthPage';
import OnboardingWizard from './pages/OnboardingWizard';

// --- DASHBOARD PAGES (Yeh sab apni file mein khud AppShell/Sidebar use kar rahe hain) ---
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import ImportPage from "./pages/ImportPage.jsx";
import CleanPage from "./pages/CleanPage.jsx";
import MappingPage from "./pages/MappingPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import PublishPage from "./pages/PublishPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";



const router = createBrowserRouter([
  // 1. Public Website Routes (Sirf yahan public header / footer show hoga)
  {
    path: "/",
    element: <AppLayout />, 
    children: [            
      { path: "", element: <Home /> },
      { path: "how-it-works", element: <HowItWorksPage /> },
    ],
  },
  {
    path: "/auth",
    element: <AuthPage />
  },
  
  // 2. Onboarding Route (Full screen)
  {
    path: "/onboarding",
    element: <OnboardingWizard />
  },

  // 3. Dashboard Routes (Flat & Independent - Public header yahan bilkul show nahi hoga)
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/dashboard/import", element: <ImportPage /> },
  { path: "/dashboard/clean", element: <CleanPage /> },
  { path: "/dashboard/mapping", element: <MappingPage /> },
  { path: "/dashboard/review", element: <ReviewPage /> },
  { path: "/dashboard/publish", element: <PublishPage /> },
  { path: "/dashboard/settings", element: <SettingsPage /> },
  

]);

const App = () => {
  return (
    <ToastProvider>
      <PipelineProvider>
        <RouterProvider router={router} />
      </PipelineProvider>
    </ToastProvider>
  );
};

export default App;