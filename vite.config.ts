import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // 
  // IMPORTANT: This enables proper environment file loading:
  // - .env.dev (when mode = 'development')
  // - .env.preprod (when mode = 'preprod') 
  // - .env.production (when mode = 'production')
  // - .env (fallback)
  // - .env.local (local overrides, highest priority)
  //
  // Use npm scripts: npm run dev, npm run dev:preprod, npm run dev:production
  // DO NOT copy .env files to .env.local - let Vite handle it!
  loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: '/app/',
    server: {
      port: 5173,
      strictPort: true,
      host: 'localhost',
      hmr: {
        port: 5173,
        host: 'localhost'
      }
    },
    define: {
      global: 'globalThis',
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        maxParallelFileOps: 5,
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('@mui/icons-material')) {
                return 'mui-icons';
              }
              if (id.includes('@mui')) {
                return 'mui';
              }
              if (id.includes('@aws-amplify') || id.includes('aws-amplify')) {
                return 'aws';
              }
              if (id.includes('@hashgraph')) {
                return 'hedera';
              }
              return 'vendor';
            }
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        '@mui/material',
        '@mui/icons-material',
        '@aws-amplify/ui-react'
      ],
      exclude: ['aws-amplify']
    },
    resolve: {
      alias: {
        buffer: 'buffer',
        process: 'process/browser',
      },
    },
    publicDir: 'public',
    root: '.',
  }
})
