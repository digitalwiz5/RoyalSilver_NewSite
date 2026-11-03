import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

// Standalone Vite config (no third-party wrapper). The Cloudflare plugin is build-only;
// change or remove it when the hosting target is decided.
export default defineConfig(({ command }) => ({
  server: { host: "::", port: 8080 },
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  optimizeDeps: { include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"] },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    ...(command === "build" ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
    // Redirect TanStack Start's server entry to src/server.ts (our SSR error wrapper).
    tanstackStart({
      server: { entry: "server" },
      importProtection: { behavior: "error", client: { files: ["**/server/**"], specifiers: ["server-only"] } },
    }),
    viteReact(),
  ],
}));
