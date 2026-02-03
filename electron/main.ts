import { app, BrowserWindow, globalShortcut, ipcMain, Menu } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { initDatabase } from './db';
import { BookRepository } from './db/repositories/book.repo';
import { HighlightRepository } from './db/repositories/highlight.repo';
import { dialog } from 'electron';
import fs from 'node:fs';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
  throw reason;
});

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    minWidth: 1200,
    minHeight: 800,
    width: 1200,
    height: 800,
    title: 'PaperWhite Notes v0.1',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: false,
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

function registerIpcHandlers() {
  ipcMain.handle('books:list', (_, showDeleted: boolean = false) =>
    BookRepository.findAll(showDeleted)
  );
  ipcMain.handle('books:get', (_, id: number) => BookRepository.findById(id));
  ipcMain.handle('books:byTitle', (_, title: string) => BookRepository.findByTitle(title));
  ipcMain.handle('books:create', (_, payload) => BookRepository.create(payload));
  ipcMain.handle('books:update', (_, id: number, payload) => BookRepository.update(id, payload));
  ipcMain.handle('books:softDelete', (_, id: number) => BookRepository.softDelete(id));
  ipcMain.handle('books:hardDelete', (_, id: number) => BookRepository.hardDelete(id));
  ipcMain.handle('books:restore', (_, id: number) => BookRepository.restore(id));

  ipcMain.handle('highlights:byBook', (_, bookId: number, showDeleted: boolean = false) =>
    HighlightRepository.findByBook(bookId, showDeleted)
  );
  ipcMain.handle('highlights:byContent', (_, content: string) =>
    HighlightRepository.findByContent(content)
  );
  ipcMain.handle('highlights:create', (_, payload) => HighlightRepository.create(payload));
  ipcMain.handle('highlights:update', (_, id: number, payload) =>
    HighlightRepository.update(id, payload)
  );
  ipcMain.handle('highlights:softDelete', (_, id: number) => HighlightRepository.softDelete(id));
  ipcMain.handle('highlights:hardDelete', (_, id: number) => HighlightRepository.hardDelete(id));
  ipcMain.handle('highlights:restore', (_, id: number) => HighlightRepository.restore(id));
  ipcMain.handle('highlights:exists', (_, bookId: number, content: string) =>
    HighlightRepository.highlightExists(bookId, content)
  );

  const coversDir = path.join(app.getPath('userData'), 'covers');

  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }

  ipcMain.handle('selectCoverImage', async () => {
    const result = await dialog.showOpenDialog({
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) return null;

    const sourcePath = result.filePaths[0];
    const ext = path.extname(sourcePath);
    const randomName = crypto.randomUUID() + ext;
    const targetPath = path.join(coversDir, randomName);

    fs.copyFileSync(sourcePath, targetPath);

    return targetPath;
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.webContents.toggleDevTools();
  });
  initDatabase();
  registerIpcHandlers();
  createWindow();
});
