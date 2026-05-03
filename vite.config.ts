import { defineConfig } from 'vitest/config';
import tsconfigPaths from "vite-tsconfig-paths"
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import AutoImport from 'unplugin-auto-import/vite'
import Pages from 'vite-plugin-pages'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    react(),
    svgr({
      include: 'src/assets/**/*.svg',
    }),
    AutoImport({
      imports: [
        'react', 
        'react-router-dom',
      ],
      dts: 'src/auto-imports.d.ts',
    }),
    Pages({
      dirs: 'src/pages',
      extensions: ['tsx'],
      exclude: ['**/*.test.tsx', '**/*.spec.tsx', '**/tests/**']
    })
  ],
  optimizeDeps: {
    // These are used inside lazy-loaded Study Tracker routes.
    // Pre-bundling them on server start prevents late optimizer invalidation
    // that can surface as "Outdated Optimize Dep" during first navigation.
    include: ['recharts', 'motion/react'],
  },
  // server: {
  //   port: 3000,
  // },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import '@/scss/_shared.scss';
        `,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    css: true,
    include: ['src/tests/**/*.test.ts?(x)', 'src/tests/**/*.spec.ts?(x)'],
  },
});