import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    chunkSizeWarningLimit: 800, // Increase warning threshold to 800kb
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create specific vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('react-intersection-observer')) {
              return 'vendor-ui';
            }
            
            if (id.includes('supabase')) {
              return 'vendor-supabase';
            }

            if (id.includes('react-helmet') || id.includes('react-share')) {
              return 'vendor-utils';
            }
            
            // All other node_modules
            return 'vendor-deps';
          }
          
          // Group by feature/module folders
          if (id.includes('/src/components/')) {
            return 'components';
          }
          
          if (id.includes('/src/contexts/') || id.includes('/src/hooks/')) {
            return 'app-logic';
          }
          
          if (id.includes('/src/lib/')) {
            return 'lib';
          }
        }
      }
    }
  }
});
