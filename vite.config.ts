import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Log the URL from the browser and the path being sent to the target
            console.log(
              `[Vite Proxy] Matched ${req.url} -> Forwarding to: ${options.target}${proxyReq.path}`,
            );
          });
          proxy.on("error", (err, req, res) => {
            console.error("[Vite Proxy] Proxying Error:", err);
            // It's good practice to send a response back to the client if the proxy errors
            if (res && !res.headersSent) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Proxy error occurred");
            }
          });
        },
      },
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
