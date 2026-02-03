import { ipcRenderer, contextBridge } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

contextBridge.exposeInMainWorld('api', {
  books: {
    list: (showDeleted: boolean = false) => ipcRenderer.invoke('books:list', showDeleted),
    get: (id: number) => ipcRenderer.invoke('books:get', id),
    byTitle: (title: string) => ipcRenderer.invoke('books:byTitle', title),
    create: (data: any) => ipcRenderer.invoke('books:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('books:update', id, data),
    softDelete: (id: number) => ipcRenderer.invoke('books:softDelete', id),
    hardDelete: (id: number) => ipcRenderer.invoke('books:hardDelete', id),
    restore: (id: number) => ipcRenderer.invoke('books:restore', id),
  },

  highlights: {
    byBook: (bookId: number, showDeleted: boolean = false) =>
      ipcRenderer.invoke('highlights:byBook', bookId, showDeleted),
    byContent: (content: string) => ipcRenderer.invoke('highlights:byContent', content),
    create: (data: any) => ipcRenderer.invoke('highlights:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('highlights:update', id, data),
    softDelete: (id: number) => ipcRenderer.invoke('highlights:softDelete', id),
    hardDelete: (id: number) => ipcRenderer.invoke('highlights:hardDelete', id),
    restore: (id: number) => ipcRenderer.invoke('highlights:restore', id),
    exists: (bookId: number, content: string) =>
      ipcRenderer.invoke('highlights:exists', bookId, content),
  },
});

contextBridge.exposeInMainWorld('electron', {
  selectCoverImage: () => ipcRenderer.invoke('selectCoverImage'),
});
