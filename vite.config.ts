import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron/simple';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: path.join(__dirname, 'electron/main.ts'),
        vite: {
          build: {
            rollupOptions: {
              external: ['better-sqlite3'],
            },
          },
          plugins: [
            {
              name: 'copy-db-schema',
              closeBundle() {
                const schemaSrc = path.join(__dirname, 'electron/db/schema');
                const schemaDest = path.join(__dirname, 'dist-electron/schema');
                if (fs.existsSync(schemaSrc)) {
                  fs.mkdirSync(schemaDest, { recursive: true });
                  const files = fs.readdirSync(schemaSrc);
                  for (const file of files) {
                    fs.copyFileSync(path.join(schemaSrc, file), path.join(schemaDest, file));
                  }
                  console.log('Successfully copied schema to dist-electron');
                }
              },
            },
          ],
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
