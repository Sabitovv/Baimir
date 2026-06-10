import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

const seoStaticHeaders = (): Plugin => {
  return {
    name: 'seo-static-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? '';

        if (pathname.endsWith('.txt')) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        }

        if (pathname.endsWith('.xml')) {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        }

        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? '';

        if (pathname.endsWith('.txt')) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        }

        if (pathname.endsWith('.xml')) {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        }

        next();
      });
    },
  };
};

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    seoStaticHeaders(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,

    minify: 'esbuild',

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@mui/icons-material')) {
            return 'mui-icons';
          }

          if (id.includes('@tolgee')) {
            return 'tolgee';
          }

          if (id.includes('i18next') || id.includes('react-i18next') || id.includes('i18next-')) {
            return 'i18next';
          }

          if (id.includes('swiper')) {
            return 'swiper';
          }

          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
