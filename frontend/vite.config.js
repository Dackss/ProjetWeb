import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // prod build served by Apache under /app/ (see docker-compose.yml), dev server stays at root
  base: command === 'build' ? '/app/' : '/',
}))
