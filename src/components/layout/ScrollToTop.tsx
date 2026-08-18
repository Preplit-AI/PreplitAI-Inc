import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    // Disable browser default scroll restoration so it doesn't fight SPA routing
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 60);
        return;
      }
    }

    const resetScroll = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }
      const root = document.getElementById("root");
      if (root) {
        root.scrollTop = 0;
        root.scrollLeft = 0;
      }
    };

    // 1. Instant reset before paint
    resetScroll();

    // 2. Next frame reset after DOM updates
    const frameId = requestAnimationFrame(() => {
      resetScroll();
    });

    // 3. Fallback tick
    const timeoutId = setTimeout(() => {
      resetScroll();
    }, 10);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [pathname, search, hash]);

  return null;
}
