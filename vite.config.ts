import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron/simple';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { builtinModules } from 'node:module';
import pkg from './package.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const externals = [
  'electron',
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  'better-sqlite3',
  'bindings',
  'file-uri-to-path',
];

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    electron({
      main: {
        entry: path.join(__dirname, 'electron/main.ts'),
        vite: {
          build: {
            rollupOptions: {
              external: externals,
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            rollupOptions: {
              external: externals,
              output: {
                entryFileNames: '[name].cjs',
              },
            },
          },
        },
      },
    }),
    tailwindcss(),
  ],
  build: {
    modulePreload: false,
    target: 'chrome120',
    minify: false,
    rollupOptions: {
      external: ['electron'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
