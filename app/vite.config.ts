import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/observatorio-peru/',
  build: { chunkSizeWarningLimit: 1600 },
})
