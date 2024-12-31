const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { session } = require('electron');
const { run, processAndEmbed } = require('./model.js');
const Database = require('./db.js');
const { TextEmbeddingPipeline } = require('./model.js');
const { createWorker } = require('tesseract.js');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.resolve(__dirname, '../assets/icons/icon.png'),
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Comment out or remove this line:
    // mainWindow.webContents.openDevTools();
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {

    // Add a handler for the `transformers:run` event. This enables 2-way communication
    // between the renderer process (UI) and the main process (processing).
    // https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way
    ipcMain.handle('transformers:run', run)

    const db = await Database.getInstance();

    // Collection management handlers
    ipcMain.handle('collection:create', async (_, data) => {
        try {
            // Create new collection
            const collectionId = await db.createCollection(data.name);
            
            // Process each file
            for (const fileData of data.files) {
                const file = {
                    name: fileData.name,
                    type: fileData.type,
                    arrayBuffer: async () => Buffer.from(fileData.data),
                    size: fileData.size
                };

                // Handle different file types
                if (fileData.type.startsWith('image/')) {
                    // For images, use Tesseract OCR
                    const worker = await createWorker('eng');
                    const { data: { text } } = await worker.recognize(Buffer.from(fileData.data));
                    await worker.terminate();
                    
                    // Get embeddings for the OCR text
                    const embeddings = await processAndEmbed({ 
                        name: fileData.name,
                        type: 'text/plain',
                        arrayBuffer: async () => Buffer.from(text),
                        size: text.length
                    });
                    
                    await db.addDocuments(collectionId, embeddings.map((emb, idx) => ({
                        filename: fileData.name,
                        text: emb.text,
                        embedding: emb.embedding,
                        chunkIndex: idx
                    })));
                } else {
                    // Original handling for other file types
                    const embeddings = await processAndEmbed(file);
                    await db.addDocuments(collectionId, embeddings.map((emb, idx) => ({
                        filename: fileData.name,
                        text: emb.text,
                        embedding: emb.embedding,
                        chunkIndex: idx
                    })));
                }
            }

            return { success: true, id: collectionId };
        } catch (error) {
            console.error('Failed to create collection:', error);
            throw error;
        }
    });

    ipcMain.handle('collection:getAll', async () => {
        try {
            return await db.getCollections();
        } catch (error) {
            console.error('Failed to get collections:', error);
            throw error;
        }
    });

    ipcMain.handle('collection:delete', async (_, ids) => {
        try {
            for (const id of ids) {
                await db.deleteCollection(id);
            }
            return true;
        } catch (error) {
            console.error('Failed to delete collections:', error);
            throw error;
        }
    });

    ipcMain.handle('search:query', async (_, query, collectionId) => {
        try {
            const db = await Database.getInstance();
            
            // Get embedding for search query
            const classifier = await TextEmbeddingPipeline.getInstance();
            const result = await classifier(query);
            const queryEmbedding = Array.from(result.data);

            // Search in specified collection or all collections
            const results = await db.search(collectionId, queryEmbedding);
            return results;
        } catch (error) {
            console.error('Search failed:', error);
            throw error;
        }
    });

    createWindow();

    // Define a custom Content Security Policy to only allow loading resources from the app's origin.
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'",
                    "script-src 'self'",
                    "style-src 'self' 'unsafe-inline'",
                    "img-src 'self' blob: data:",
                ].join('; ')
            }
        });
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
