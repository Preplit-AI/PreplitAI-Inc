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
  const [gksMenuOpen, setGksMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <div 
              className="relative py-2"
              onMouseEnter={() => setGksMenuOpen(true)}
              onMouseLeave={() => setGksMenuOpen(false)}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setGksMenuOpen(!gksMenuOpen);
                }}
                className="text-[14px] font-semibold px-3 py-1.5 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>GKS2026 Prep</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gray-900 dark:bg-white text-white dark:text-black">NEW</span>
                <span className="text-[10px] text-gray-500 ml-0.5">{gksMenuOpen ? '▲' : '▼'}</span>
              </button>

              {/* CONTINUOUS HOVER ZONE WRAPPER (NO GAP PIXELS) */}
              {gksMenuOpen && (
                <div className="absolute top-full left-0 pt-1 w-64 z-50">
                  <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-2">
                    <a href="/gks/dashboard" className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                      <div className="font-bold text-gray-900 dark:text-white">{isKo ? 'GKS2026 AI 워크스페이스' : 'GKS2026 AI Workbench'}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">{isKo ? '서류 종합 분석 & 준비도 점수' : 'Dossier review & readiness score'}</div>
                    </a>
                    <a href="/gks/scholar-materials" className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors mt-1">
                      <div className="font-bold text-gray-900 dark:text-white">{isKo ? '합격자 샘플 서류 자료실' : 'Scholar Materials Library'}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">{isKo ? '역대 장학생 합격 서류 & 가이드' : 'Past scholars sample essays'}</div>
                    </a>
                    <a href="/gks/alumni-review" className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors mt-1">
                      <div className="font-bold text-gray-900 dark:text-white">{isKo ? '1:1 동문 첨삭 신청' : '1-on-1 Alumni Review'}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">{isKo ? '장학생 출신 48시간 맞춤 피드백' : '48-hour scholar manual review'}</div>
                    </a>
                  </div>
                </div>
              )}
            </div>
            <a href="/features" className="text-[14px] font-medium px-3.5 py-2 rounded-lg text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isKo ? '기능' : 'Features'}
            </a>
            <a href="/preplitai-chat" className="text-[14px] font-medium px-3.5 py-2 rounded-lg text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <span>{isKo ? '강의 녹음' : 'Lecture Buddy'}</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#8B0000] text-white">AI</span>
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

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="text-black dark:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-[100vw] bg-white dark:bg-gray-950 p-6 overflow-y-auto z-[90]">
                <nav className="mt-4 space-y-2">
                  <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 space-y-1">
                    <a href="/gks" onClick={()=>setMobileMenuOpen(false)} className="block text-center font-bold text-sm text-black dark:text-white hover:underline py-1">
                      GKS2026 Prep
                    </a>
                    <div className="grid grid-cols-1 gap-1 pt-1 border-t border-gray-200 dark:border-gray-800 text-xs">
                      <a href="/gks/dashboard" onClick={()=>setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 text-center font-medium">
                        {isKo ? 'AI 워크스페이스' : 'GKS2026 AI Workbench'}
                      </a>
                      <a href="/gks/scholar-materials" onClick={()=>setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 text-center font-medium">
                        {isKo ? '합격자 샘플 서류 자료실' : 'Scholar Materials Library'}
                      </a>
                      <a href="/gks/alumni-review" onClick={()=>setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 text-center font-medium">
                        {isKo ? '1:1 동문 서류 첨삭 신청' : '1-on-1 Alumni Review'}
                      </a>
                    </div>
                  </div>

                  <a href="/preplitai-chat" onClick={()=>setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl font-semibold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 shadow-sm text-center">
                    {isKo ? 'AI 학습 워크스페이스 시작' : 'Launch Workspace'}
                  </a>
                  <a href="/features" onClick={()=>setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium">
                    {isKo ? '기능' : 'Features'}
                  </a>
                  <a href="/preplitai-chat" onClick={()=>setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium flex items-center justify-between">
                    <span>{isKo ? 'AI 강의 녹음' : 'AI Lecture Buddy'}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#8B0000] text-white">AI</span>
                  </a>
                  <a href="/pricing" onClick={()=>setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium">
                    {isKo ? '요금제' : 'Pricing'}
                  </a>
                  <a href="/about" onClick={()=>setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium">
                    {isKo ? '소개' : 'About'}
                  </a>
                  <a href="/blog" onClick={()=>setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium">
                    {isKo ? '블로그' : 'Blog'}
                  </a>
                </nav>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-2 text-sm text-gray-600 dark:text-gray-400">Signed in as</div>
                      <div className="px-2 font-medium text-black dark:text-white">{user.name}</div>
                      <Button onClick={() => { setMobileMenuOpen(false); logout(); }} className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black">
                        <LogOut className="h-4 w-4 mr-2" /> {isKo ? '로그아웃' : 'Logout'}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => { setMobileMenuOpen(false); setAuthTab("login"); setShowAuthModal(true); }}
                        className="border-gray-300 dark:border-gray-700"
                      >
                        {isKo ? '로그인' : 'Login'}
                      </Button>
                      <Button
                        onClick={() => { setMobileMenuOpen(false); setAuthTab("signup"); setShowAuthModal(true); }}
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
      <div className="h-16" />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authTab}
      />
    </>
  );
};
