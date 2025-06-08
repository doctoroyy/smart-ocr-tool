import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'Module': 'undefined'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    include: ['@paddlejs-models/ocr'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'Module': 'undefined'
      }
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        globals: {
          'Module': 'undefined'
        }
      }
    }
  }
})