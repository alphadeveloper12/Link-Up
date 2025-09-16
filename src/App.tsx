import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

import TeamMatch from "./pages/TeamMatch";
import ProjectDashboard from "./pages/ProjectDashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Analytics from "./pages/Analytics";
import Training from "./pages/Training";
import Support from "./pages/Support";
import ChooseYourPath from "./pages/ChooseYourPath";
import TeamProfile from "./pages/TeamProfile";
import NotFound from "./pages/NotFound";
import EmailCampaigns from "./pages/EmailCampaigns";
import EmailConsole from "./pages/EmailConsole";
import Projects from "./pages/Projects";
import TeamDashboard from "./pages/TeamDashboard";
import Admin from "./pages/Admin";
import { AdminRoute } from "@/components/AdminRoute";
import Proposals from "./pages/Proposals";
import { ChatBot } from "@/components/ChatBot";
import Index from "./pages/Index";
import ForgotPassword from "./routes/ForgotPassword";
import ResetPassword from "./routes/ResetPassword";
import AuthCallback from "./routes/AuthCallback";
import HireChecklist from './pages/HireChecklist';
import ProjectDetail from './components/ProjectDetail';
import DynamicProjectDashboard from './components/DynamicProjectDashboard';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import { ROUTES } from "./utils/routes";

// 👉 import your Navigation here
import Navigation from "@/components/Navigation";

const queryClient = new QueryClient();

const App = () => {
  // Handle both Supabase authentication flows
  useEffect(() => {
    (async () => {
      const hasHash = typeof window !== 'undefined' && window.location.hash.includes('access_token');
      const hasCode = typeof window !== 'undefined' && window.location.search.includes('code=');
      
      if (!hasHash && !hasCode) return;

      let error = null;

      if (hasHash) {
        const result = await supabase.auth.getSessionFromUrl({ storeSession: true });
        error = result.error;
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState({}, '', cleanUrl);
      } else if (hasCode) {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          const result = await supabase.auth.exchangeCodeForSession({ code });
          error = result.error;
        }
      }

      if (error) {
        window.location.replace(ROUTES.signin);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') || ROUTES.start;
      const intent = params.get('intent');

      const target =
        next ||
        (intent === 'team'
          ? ROUTES.teamProfile.replace('/:teamId?', '')
          : intent === 'client'
          ? ROUTES.postProject
          : ROUTES.start);

      window.location.replace(target);
    })();
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* 👇 Navigation always visible */}
            <Navigation />

            {/* 👇 All your routes */}
            <Routes>
              <Route path="/signin" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset" element={<ResetPassword />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/training" element={<Training />} />
              <Route path="/start" element={<ChooseYourPath />} />
              <Route path="/support" element={<Support />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/team-match" element={<TeamMatch />} />
              <Route path="/team-profile" element={<TeamProfile />} />
              <Route path="/team-profile/create" element={<TeamProfile />} />
              <Route path="/team-profile/:teamId" element={<TeamProfile />} />
              <Route path="/project/:projectId" element={<DynamicProjectDashboard />} />
              <Route path="/project-dashboard/:projectId" element={<ProjectDashboardPage />} />
              <Route path="/project-dashboard/:projectId/:teamId" element={<ProjectDashboardPage />} />
              <Route path="/email-campaigns" element={<EmailCampaigns />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/project-dashboard" element={<Projects />} />
              <Route path="/team-dashboard" element={<TeamDashboard />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/admin/email-console" element={<AdminRoute><EmailConsole /></AdminRoute>} />
              <Route path="/hire/:teamId" element={<HireChecklist />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* 👇 ChatBot still at the bottom */}
            <ChatBot />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
