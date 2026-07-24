import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { compression } from 'vite-plugin-compression2';

const moveCssBeforeScript = (): Plugin => {
  return {
    name: 'move-css-before-script',
    transformIndexHtml(html) {
      const scriptMatch = html.match(/<script[^>]+type="module"[^>]*><\/script>/);
      const cssMatch = html.match(/<link rel="stylesheet"[^>]*>/);

      if (scriptMatch && cssMatch) {
        const scriptTag = scriptMatch[0];
        const cssTag = cssMatch[0];
        html = html.replace(cssTag, '');
        html = html.replace(scriptTag, `${cssTag}\n  ${scriptTag}`);
      }

      return html;
    },
  };
};

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

const manualVendorChunks = (id: string) => {
  const normalizedId = id.replace(/\\/g, '/');

  if (!normalizedId.includes('/node_modules/')) return undefined;

  if (
    normalizedId.includes('/node_modules/react/')
    || normalizedId.includes('/node_modules/react-dom/')
    || normalizedId.includes('/node_modules/scheduler/')
  ) {
    return 'react-core';
  }

  if (
    normalizedId.includes('/node_modules/react-router/')
    || normalizedId.includes('/node_modules/react-router-dom/')
  ) {
    return 'react-router';
  }

  if (
    normalizedId.includes('/node_modules/@reduxjs/toolkit/')
    || normalizedId.includes('/node_modules/react-redux/')
    || normalizedId.includes('/node_modules/redux/')
    || normalizedId.includes('/node_modules/redux-thunk/')
    || normalizedId.includes('/node_modules/reselect/')
    || normalizedId.includes('/node_modules/immer/')
    || normalizedId.includes('/node_modules/use-sync-external-store/')
  ) {
    return 'state-redux';
  }

  if (normalizedId.includes('/node_modules/zustand/')) {
    return 'state-zustand';
  }

  if (normalizedId.includes('/node_modules/@mui/icons-material/')) {
    return 'mui-icons';
  }

  if (
    normalizedId.includes('/node_modules/@mui/')
    || normalizedId.includes('/node_modules/@emotion/')
  ) {
    return 'mui-core';
  }

  if (normalizedId.includes('/node_modules/framer-motion/')) {
    return 'motion';
  }

  if (
    normalizedId.includes('/node_modules/@tolgee/')
  ) {
    return 'tolgee';
  }

  if (
    normalizedId.includes('/node_modules/i18next/')
    || normalizedId.includes('/node_modules/react-i18next/')
    || normalizedId.includes('/node_modules/i18next-browser-languagedetector/')
    || normalizedId.includes('/node_modules/i18next-http-backend/')
  ) {
    return 'i18next';
  }

  if (normalizedId.includes('/node_modules/swiper/')) {
    return 'swiper';
  }

  if (normalizedId.includes('/node_modules/dompurify/')) {
    return 'sanitize';
  }

  if (normalizedId.includes('/node_modules/@cyntler/react-doc-viewer/')) {
    return 'doc-viewer';
  }

  return 'vendor-misc';
};

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    moveCssBeforeScript(),
    seoStaticHeaders(),
    ViteImageOptimizer({
      includePublic: true,
      cache: true,
      cacheLocation: 'node_modules/.cache/vite-plugin-image-optimizer',
      logStats: true,
      png: {
        quality: 85,
      },
      jpeg: {
        quality: 80,
        mozjpeg: true,
      },
      jpg: {
        quality: 80,
        mozjpeg: true,
      },
      webp: {
        quality: 80,
        effort: 4,
      },
      avif: {
        quality: 75,
        effort: 4,
      },
    }),
    compression({
      algorithms: ['gzip', 'brotliCompress'],
      threshold: 1024,
      skipIfLargerOrEqual: true,
    }),
    visualizer({
      open: false,
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
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,

    minify: 'esbuild',

    rollupOptions: {
      output: {
        manualChunks: manualVendorChunks,
      },
    },
  },
});
