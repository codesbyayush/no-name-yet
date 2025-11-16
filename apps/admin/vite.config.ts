import { tanstackRouter } from '@tanstack/router-plugin/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import alchemy from 'alchemy/cloudflare/vite';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      target: 'react',
    }),
    basicSsl() as any,
    react(),
    alchemy(),
  ],
  server: {
    port: 3002,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@workspace/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@workspace/ui/lib': path.resolve(__dirname, '../../packages/ui/src/lib'),
      '@workspace/ui/components': path.resolve(
        __dirname,
        '../../packages/ui/src/components',
      ),
      '@workspace/ui/hooks': path.resolve(
        __dirname,
        '../../packages/ui/src/hooks',
      ),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
