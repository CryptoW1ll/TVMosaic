// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react()],
    // Production-specific settings
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      minify: 'terser',
      sourcemap: false, // Enable only if needed
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks if needed
            react: ['react', 'react-dom'],
            vendor: ['lodash', 'axios'],
          }
        }
      }
    },
    server: {
      // These settings only affect dev server
      port: 5173,
      strictPort: true,
    },
    define: {
      'process.env': env // Pass environment variables to your app
    }
  }
})