import { defineConfig } from "vitest/config";
import type { Connect, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/*
 * Two kinds of page:
 *   - the static pages written by scripts/build-site.mjs, English first: the
 *     landing page, index.html (English, at /) and ko/index.html (Korean, at
 *     /ko/), and the pricing page, pricing/index.html and ko/pricing/index.html;
 *   - the React app, app.html, for /app, /login, /signup, /privacy and anything else.
 * vercel.json routes production the same way this plugin routes dev and preview.
 */
/* The static pages, by the paths people type, with or without the last slash. */
const PAGES: Record<string, string> = {
  "/ko": "/ko/index.html",
  "/pricing": "/pricing/index.html",
  "/pricing/": "/pricing/index.html",
  "/ko/pricing": "/ko/pricing/index.html",
  "/ko/pricing/": "/ko/pricing/index.html",
};
const STATIC_PREFIXES = ["/api/", "/kit/", "/site/", "/brand/", "/js/", "/src/", "/node_modules/", "/@", "/assets/"];

function routeToApp(): Plugin {
  const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
    const url = req.url ?? "/";
    const [pathname, query] = url.split("?");
    if (PAGES[pathname]) {
      req.url = PAGES[pathname] + (query ? `?${query}` : "");
    } else if (
      pathname !== "/" &&
      pathname !== "/ko/" &&
      !path.extname(pathname) &&
      !STATIC_PREFIXES.some((p) => pathname.startsWith(p))
    ) {
      req.url = "/app.html" + (query ? `?${query}` : "");
    }
    next();
  };
  return {
    name: "junbee-route-to-app",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  appType: "mpa",
  server: {
    // Localhost only. To open the dev site from a phone on the same network,
    // run `npm run dev -- --host`.
    host: "localhost",
    port: 8080,
    proxy: {
      "^/api/": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      "^/api/": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  plugins: [routeToApp(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        ko: path.resolve(__dirname, "ko/index.html"),
        pricing: path.resolve(__dirname, "pricing/index.html"),
        koPricing: path.resolve(__dirname, "ko/pricing/index.html"),
        app: path.resolve(__dirname, "app.html"),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
