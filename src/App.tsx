import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/lib/auth";
import { LangProvider } from "@/lib/lang";
import Landing from "@/pages/Landing";
import { Login, Signup } from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { AppLayout } from "@/app/AppLayout";

// The app screens and the privacy notice load on demand; the landing page does not wait for them.
const Privacy = lazy(() => import("@/pages/Privacy"));
const Learn = lazy(() => import("@/app/Learn"));
const LectureNote = lazy(() => import("@/app/LectureNote"));
const Remember = lazy(() => import("@/app/Remember"));
const Account = lazy(() => import("@/app/Account"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, err) => {
        const status = (err as { status?: number }).status ?? 0;
        return status >= 500 && count < 2;
      },
    },
  },
});

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LangProvider>
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/app" element={<AppLayout />}>
                    <Route index element={<Navigate to="learn" replace />} />
                    <Route path="learn" element={<Learn />} />
                    <Route path="learn/:id" element={<LectureNote />} />
                    <Route path="remember" element={<Remember />} />
                    <Route path="account" element={<Account />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </LangProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
