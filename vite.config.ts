import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), viteSingleFile({ useRecommendedBuildConfig: true })],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Need this for Chrome file:// execution
      target: 'esnext',
      modulePreload: false,
      cssCodeSplit: false,
      minify: 'esbuild' as const,
      cssMinify: 'esbuild' as const,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
    esbuild: {
      legalComments: 'none' as const,
      drop: ['debugger' as const],
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
