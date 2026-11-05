import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Bee } from "@/brand/Bee";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useDocumentLang } from "@/lib/lang";

/*
 * The pilot app. Its navigation is Learn and Remember and nothing else: no
 * greyed-out Organize, no "coming soon" Build (pilot plan, definition of done).
 * Every string here is Korean.
 */
export function AppLayout() {
  const { status, user } = useAuth();
  const location = useLocation();
  useDocumentLang("ko");

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center" aria-busy="true" aria-label="불러오는 중">
        <Bee className="h-10 w-auto opacity-70" />
      </div>
    );
  }
  if (status === "signed-out") {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh font-kr">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bone">
        본문으로 건너뛰기
      </a>
      <header className="sticky top-0 z-30 border-b border-rule bg-bone/95 backdrop-blur supports-[backdrop-filter]:bg-bone/80">
        <div className="page flex h-16 items-center gap-5 sm:gap-8">
          <Link to="/app/learn" aria-label="Junbee 처음으로" className="flex items-center gap-2 rounded-md">
            <Bee className="h-7 w-auto" />
            <span className="hidden font-sans text-[1.3rem] font-bold tracking-[-0.035em] sm:inline">Junbee</span>
          </Link>
          <nav aria-label="주 메뉴" className="flex h-full items-stretch gap-1">
            <Tab to="/app/learn">배움</Tab>
            <Tab to="/app/remember">기억</Tab>
          </nav>
          <Link
            to="/app/account"
            aria-label="계정"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-rule-strong bg-paper text-sm font-semibold text-ink hover:border-ink"
          >
            {initial}
          </Link>
        </div>
      </header>
      <main id="main" className="page pb-24 pt-8 sm:pt-10">
        <Outlet />
      </main>
    </div>
  );
}

function Tab({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "relative flex items-center px-3 text-[1.0625rem] font-semibold transition-colors",
          isActive
            ? "text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:bg-ink"
            : "text-slate hover:text-ink",
        )
      }
    >
      {children}
    </NavLink>
  );
}
