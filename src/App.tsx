import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TopNav } from "@/components/layout/TopNav";
import { Analytics } from "@/components/seo/Analytics";
import { RouteChangeTracker } from "@/components/seo/RouteChangeTracker";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import FeaturesPage from "./pages/FeaturesPage";
import RequestDemo from "./pages/RequestDemo";
import StatusPage from "./pages/Status";
import APIPage from "./pages/APIPage";
import About from "./pages/About";
import TalkToSales from "./pages/TalkToSales";
import AccountOverview from "./pages/AccountOverview";
import AccountSettings from "./pages/AccountSettings";
import Credits from "./pages/Credits";
import PreplitAIChat from "./pages/PreplitAIChat";
import Blog from "./pages/Blog";

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
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/demo" element={<RequestDemo />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/developers" element={<APIPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/sales" element={<TalkToSales />} />
            <Route path="/account" element={<AccountOverview />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/preplitai-chat" element={<PreplitAIChat />} />
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
