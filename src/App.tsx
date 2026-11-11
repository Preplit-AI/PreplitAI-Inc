import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/lib/auth";
import { LangProvider } from "@/lib/lang";
import { ForgotPassword, Login, ResetPassword, Signup } from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { AppLayout } from "@/app/AppLayout";
import { EarlyWall } from "@/site/EarlyAccess";

/** "/" is the static landing page, outside this app, so a link to it here needs a full page load. */
function StaticHome() {
  useEffect(() => {
    window.location.replace("/");
  }, []);
  return null;
}

// The app screens and the privacy notice load on demand; the sign-in pages do not wait for them.
const Privacy = lazy(() => import("@/pages/Privacy"));
const Learn = lazy(() => import("@/app/Learn"));
const LectureNote = lazy(() => import("@/app/LectureNote"));
const Remember = lazy(() => import("@/app/Remember"));
const Account = lazy(() => import("@/app/Account"));
const Semester = lazy(() => import("@/workspace/Semester"));
const CourseSpace = lazy(() => import("@/workspace/CourseSpace"));
const Organize = lazy(() => import("@/workspace/Organize"));
const Build = lazy(() => import("@/workspace/Build"));

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
                  <Route path="/" element={<StaticHome />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  {/* The workspace is not public yet: it shows the early-access note (src/site/EarlyAccess.tsx). */}
                  {/* One shell for every signed-in screen, so a recording in progress survives moving between them. */}
                  <Route element={<EarlyWall feature="workspace"><AppLayout /></EarlyWall>}>
                    <Route path="/workspace" element={<Semester />} />
                    <Route path="/workspace/organize" element={<Organize />} />
                    <Route path="/workspace/build" element={<Build />} />
                    <Route path="/workspace/courses/:id" element={<CourseSpace />} />
                    <Route path="/app" element={<Navigate to="/workspace" replace />} />
                    <Route path="/app/learn" element={<Learn />} />
                    <Route path="/app/learn/:id" element={<LectureNote />} />
                    <Route path="/app/remember" element={<Remember />} />
                    <Route path="/app/account" element={<Account />} />
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
