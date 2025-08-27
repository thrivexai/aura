// D:\Aura\frontend\vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  esbuild: {
    loader: 'jsx',
    // ⬇️ APLICAR a .jsx **y** a .js dentro de /src
    include: /src\/.*\.(jsx|js)$/,
    jsx: 'automatic',
  },
})