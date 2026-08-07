import {
  User,
  LogOut,
  Menu,
  LayoutDashboard,
  Settings,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { CreditBadge } from "@/components/credits/CreditBadge";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "react-router-dom";

export const TopNav = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  if (location.pathname === "/preplitai-chat") {
    return null;
  }

  const isKo = language === 'ko';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200/60 dark:border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Logo */}
          <a href="/" className="flex items-center gap-2 group shrink-0">
            <img src="/logo.png" alt="PreplitAI Logo" className="h-9 w-auto transition-transform group-hover:scale-105 dark:drop-shadow-[0_0_1px_rgba(255,255,255,1)]" />
            <span className="text-[17px] font-semibold tracking-tight text-black dark:text-white">PreplitAI</span>
          </a>

          {/* Center: Clean Simple Navigation Links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <a href="/features" className="text-[14px] font-medium px-3.5 py-2 rounded-lg text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isKo ? '기능' : 'Features'}
            </a>
            <a href="/pricing" className="text-[14px] font-medium px-3.5 py-2 rounded-lg text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isKo ? '요금제' : 'Pricing'}
            </a>
            <a href="/about" className="text-[14px] font-medium px-3.5 py-2 rounded-lg text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isKo ? '소개' : 'About'}
            </a>
            <a href="/blog" className="text-[14px] font-medium px-3.5 py-2 rounded-lg text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isKo ? '블로그' : 'Blog'}
            </a>
          </nav>

          {/* Right: Actions (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* KR | EN Language Switcher Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Switch Language (한국어 / English)"
            >
              <Globe className="w-3.5 h-3.5 text-black dark:text-white" />
              <span className={isKo ? 'text-black dark:text-white font-bold' : 'text-gray-400 dark:text-gray-500'}>KR</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className={!isKo ? 'text-black dark:text-white font-bold' : 'text-gray-400 dark:text-gray-500'}>EN</span>
            </button>

            {user && <CreditBadge />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white">
                    <User className="h-4 w-4 mr-2" />
                    <span className="max-w-[120px] truncate">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-black dark:text-white">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/preplitai-chat" className="cursor-pointer text-black dark:text-white">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{isKo ? 'AI 스터디 워크스페이스' : 'AI Study Workspace'}</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/settings" className="cursor-pointer text-black dark:text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{isKo ? '계정 설정' : 'Account Settings'}</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isKo ? '로그아웃' : 'Logout'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => { setAuthTab("login"); setShowAuthModal(true); }}
                  className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                >
                  {isKo ? '로그인' : 'Log in'}
                </Button>
                <Button
                  asChild
                  className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-full font-medium text-sm px-4 h-9 shadow-sm"
                >
                  <a href="/preplitai-chat" className="flex items-center gap-1.5">
                    <span>{isKo ? '워크스페이스 시작' : 'Launch Workspace'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger + KR/EN toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/10 text-xs font-semibold"
              title="언어 변경 (KR / EN)"
            >
              <Globe className="w-3.5 h-3.5 text-black dark:text-white" />
              <span className={isKo ? 'text-black dark:text-white font-bold' : 'text-gray-400'}>KR</span>
              <span>|</span>
              <span className={!isKo ? 'text-black dark:text-white font-bold' : 'text-gray-400'}>EN</span>
            </button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="text-black dark:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-[100vw] bg-white dark:bg-gray-950 p-6 overflow-y-auto">
                <nav className="mt-4 space-y-2">
                  <a href="/preplitai-chat" className="block px-4 py-3 rounded-xl font-semibold text-white bg-[#630000] hover:bg-[#7a0000] shadow-sm text-center">
                    {isKo ? 'AI 학습 워크스페이스 시작' : 'Launch Workspace'}
                  </a>
                  <a href="/features" className="block px-4 py-3 rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium">
                    {isKo ? '기능' : 'Features'}
                  </a>
                  <a href="/pricing" className="block px-4 py-3 rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium">
                    {isKo ? '요금제' : 'Pricing'}
                  </a>
                  <a href="/about" className="block px-4 py-3 rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium">
                    {isKo ? '소개' : 'About'}
                  </a>
                  <a href="/blog" className="block px-4 py-3 rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium">
                    {isKo ? '블로그' : 'Blog'}
                  </a>
                </nav>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-2 text-sm text-gray-600 dark:text-gray-400">Signed in as</div>
                      <div className="px-2 font-medium text-black dark:text-white">{user.name}</div>
                      <Button onClick={logout} className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black">
                        <LogOut className="h-4 w-4 mr-2" /> {isKo ? '로그아웃' : 'Logout'}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => { setAuthTab("login"); setShowAuthModal(true); }}
                        className="border-gray-300 dark:border-gray-700"
                      >
                        {isKo ? '로그인' : 'Login'}
                      </Button>
                      <Button
                        onClick={() => { setAuthTab("signup"); setShowAuthModal(true); }}
                        className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black"
                      >
                        {isKo ? '회원가입' : 'Sign Up'}
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <div className="h-14" />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authTab}
      />
    </>
  );
};
