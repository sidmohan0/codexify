// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

// Here, we use the `contextBridge` API to expose a custom API to the renderer process.
// This API allows the renderer process to invoke the `transformers:run` event in the main process.
contextBridge.exposeInMainWorld('electronAPI', {
    run: (text) => ipcRenderer.invoke('transformers:run', text),
    createCollection: (data) => ipcRenderer.invoke('collection:create', data),
    getCollections: () => ipcRenderer.invoke('collection:getAll'),
    deleteCollections: (ids) => ipcRenderer.invoke('collection:delete', ids),
    search: (query, collectionId) => ipcRenderer.invoke('search:query', query, collectionId)
});
