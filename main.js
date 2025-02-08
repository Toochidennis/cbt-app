const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs').promises;

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

let mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: Math.min(1200, width * 0.8), // 80% of screen width or 1200px, whichever is smaller
        height: Math.min(800, height * 0.8),
        frame: false,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            devTools: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
    });

    // Listen for maximize/unmaximize events
    mainWindow.on("maximize", () => {
        mainWindow.webContents.send("window-maximized");
    });

    mainWindow.on("unmaximize", () => {
        mainWindow.webContents.send("window-restored");
    });

    // IPC handlers for window controls
    ipcMain.on("minimize-window", () => {
        mainWindow.minimize();
    });

    ipcMain.on("maximize-window", () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on("close-window", () => {
        mainWindow.close();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-questions', async () => {
    try {
        const filePath = path.join(__dirname, 'assets/data/questions.json');
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading questions.json:', error);
        throw error;
    }
});

function openSelectExamDialog() {
    let selectExamWindow = new BrowserWindow({
        width: 800,
        height: 600,
        modal: true,
        frame: false,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    selectExamWindow.loadFile('pages/select-exams.html')

    const closeHandler = () => {
        if (selectExamWindow && !selectExamWindow.isDestroyed()) {
            mainWindow.webContents.send('second-window-closed');
            selectExamWindow.close();
        }
    }

    // Register the listener for this window instance
    ipcMain.once("close-select-exam-window", closeHandler);

    // When the window is closed, remove the listener to avoid referencing a destroyed window
    selectExamWindow.on('closed', () => {
        ipcMain.removeListener("close-select-exam-window", closeHandler);
    });

    // Adjust size after content loads
    selectExamWindow.webContents.once('did-finish-load', () => {
        selectExamWindow.webContents.executeJavaScript(`
            new Promise(resolve => {
                const { scrollWidth, scrollHeight } = document.documentElement;
                resolve({ width: scrollWidth, height: scrollHeight });
            });
        `).then(size => {
            selectExamWindow.setBounds({
                width: Math.min(size.width + 20, 800),  // Limit max width
                height: Math.min(size.height + 20, 600) // Limit max height
            });
        });
    });
}

ipcMain.on('open-exam-window', () => {
    openSelectExamDialog();
});
