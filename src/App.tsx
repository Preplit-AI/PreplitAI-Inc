import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TopNav } from "@/components/layout/TopNav";
import { Analytics } from "@/components/seo/Analytics";
import { RouteChangeTracker } from "@/components/seo/RouteChangeTracker";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import StatusPage from "./pages/Status";
import APIPage from "./pages/APIPage";
import About from "./pages/About";
import TalkToSales from "./pages/TalkToSales";
import AccountOverview from "./pages/AccountOverview";
import AccountSettings from "./pages/AccountSettings";
import Credits from "./pages/Credits";
import PreplitAIChat from "./pages/PreplitAIChat";
import Blog from "./pages/Blog";
import GKSDashboard from "./pages/GKSDashboard";
import GKSScholarMaterials from "./pages/GKSScholarMaterials";
import GKSAlumniReview from "./pages/GKSAlumniReview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
        <Analytics />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteChangeTracker />
          <TopNav />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/features" element={<Navigate to="/#features" replace />} />
            <Route path="/request-demo" element={<TalkToSales />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/api-docs" element={<APIPage />} />
            <Route path="/gks" element={<GKSDashboard />} />
            <Route path="/gks/dashboard" element={<GKSDashboard />} />
            <Route path="/gks/scholar-materials" element={<GKSScholarMaterials />} />
            <Route path="/gks/alumni-review" element={<GKSAlumniReview />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/sales" element={<TalkToSales />} />
            <Route path="/account" element={<AccountOverview />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/workspace" element={<PreplitAIChat />} />
            <Route path="/preplitai-chat" element={<Navigate to="/workspace" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
   </LanguageProvider>
  </QueryClientProvider>
);

export default App;
