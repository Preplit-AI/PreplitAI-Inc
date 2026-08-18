import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, LogOut, Menu, LayoutDashboard, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export const TopNav = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (location.pathname === "/workspace" || location.pathname === "/preplitai-chat" || location.pathname.startsWith("/gks")) {
    return null;
  }

  const isKo = language === "ko";

  return (
    <>
      <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav
          className={`pointer-events-auto flex items-center justify-between gap-4 px-6 py-2.5 rounded-full border transition-all duration-300 ${
            scrolled
              ? "bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl border-black/[0.08] dark:border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              : "bg-white dark:bg-[#121212] border-black/[0.06] dark:border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          } max-w-[840px] w-full`}
        >
          {/* Brand Logo on Left */}
          <Link to="/" className="flex items-center gap-2 group shrink-0 py-0.5">
            <img
              src="/logo.png"
              alt="PreplitAI Logo"
              className="h-8 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Center Links (FEATURES, BLOG, PRICING, GKS PREP in clean uppercase) */}
          <div className="hidden md:flex items-center gap-7 text-[11.5px] font-bold tracking-widest text-[#555555] dark:text-[#888888] uppercase">
            <a href="/#features" className="hover:text-[#111111] dark:hover:text-white transition-colors">
              {isKo ? "기능" : "FEATURES"}
            </a>
            <Link to="/blog" className="hover:text-[#111111] dark:hover:text-white transition-colors">
              {isKo ? "블로그" : "BLOG"}
            </Link>
            <Link to="/pricing" className="hover:text-[#111111] dark:hover:text-white transition-colors">
              {isKo ? "요금제" : "PRICING"}
            </Link>
            <Link to="/gks/dashboard" className="hover:text-[#111111] dark:hover:text-white transition-colors">
              GKS PREP
            </Link>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#111] dark:text-white text-xs font-semibold hover:bg-slate-200">
                    <User className="w-3.5 h-3.5" />
                    <span className="max-w-[90px] truncate">{user.email?.split("@")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#1a1a1a] rounded-2xl p-1.5 shadow-xl border-black/[0.08]">
                  <DropdownMenuItem asChild>
                    <Link to="/workspace" className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl cursor-pointer">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      {isKo ? "학습 워크스페이스" : "Workspace"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {isKo ? "로그아웃" : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => {
                  setAuthTab("login");
                  setShowAuthModal(true);
                }}
                className="px-4 py-1.5 rounded-full text-slate-700 dark:text-slate-300 text-[13px] font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {isKo ? "로그인" : "Log in"}
              </button>
            )}

            {/* Solid Black Start Button with Arrow */}
            <a
              href="/workspace"
              className="inline-flex items-center gap-1 px-5 py-2 rounded-full bg-[#111111] hover:bg-[#000000] text-white text-[13px] font-semibold transition-all duration-150 active:scale-[0.97] shadow-xs"
            >
              <span>{isKo ? "시작하기" : "Start"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Mobile Hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#111111] dark:text-white transition-colors"
                  aria-label="Toggle Menu"
                >
                  <Menu className="w-4 h-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-white dark:bg-[#111111] p-6">
                <SheetTitle className="text-left font-bold text-lg mb-6">PreplitAI</SheetTitle>
                <div className="flex flex-col gap-2">
                  <a
                    href="/#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#555] dark:text-[#aaa] hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    FEATURES
                  </a>
                  <Link
                    to="/blog"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#555] dark:text-[#aaa] hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    BLOG
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#555] dark:text-[#aaa] hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    PRICING
                  </Link>
                  <Link
                    to="/gks/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#555] dark:text-[#aaa] hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    GKS PREP
                  </Link>
                  {/* Mobile Auth & Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/10 mt-2 space-y-2">
                    {user ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-neutral-900 rounded-xl">
                          <User className="w-4 h-4 text-[#550000]" />
                          <span className="text-xs font-semibold truncate text-neutral-800 dark:text-white">
                            {user.email}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-200 dark:border-red-950 hover:bg-red-50 text-center"
                        >
                          {isKo ? "로그아웃" : "Log out"}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setAuthTab("login");
                            setShowAuthModal(true);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full py-2.5 rounded-full border border-slate-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-white text-center"
                        >
                          {isKo ? "로그인" : "Log In"}
                        </button>
                        <button
                          onClick={() => {
                            setAuthTab("signup");
                            setShowAuthModal(true);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full py-2.5 rounded-full bg-[#550000] text-white text-xs font-semibold text-center shadow-xs"
                        >
                          {isKo ? "가입하기" : "Sign Up"}
                        </button>
                      </div>
                    )}

                    <Link
                      to="/workspace"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1 w-full py-2.5 rounded-full bg-[#111] text-white text-xs font-semibold shadow-xs"
                    >
                      <span>{isKo ? "워크스페이스 시작" : "Start Workspace"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authTab}
      />
    </>
  );
};
