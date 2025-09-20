import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Configuração alternativa sem WebSocket/HMR
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: false, // Desabilita completamente o HMR/WebSocket
    watch: {
      usePolling: true,
    },
  },
})