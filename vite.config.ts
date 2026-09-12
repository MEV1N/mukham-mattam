import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/*.mp4', '**/*.mkv', '**/*.avi', '**/*.mov']
    }
  }
})
