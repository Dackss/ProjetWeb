import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Cette ligne force TOUT le projet (et les bibliothèques) à utiliser le même React
    dedupe: ["react", "react-dom"],
  },
    // prod build served by Apache under /app/ (see docker-compose.yml), dev server stays at root
  base: command === 'build' ? '/app/' : '/',
}));
