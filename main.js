const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const db = require('./database/db')

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit',
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
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
    });

    // Listen for maximize/unmaximize events
    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('window-maximized');
    });

    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('window-restored');
    });

    // IPC handlers for window controls
    ipcMain.on('minimize-window', () => {
        mainWindow.minimize();
    });

    ipcMain.on('maximize-window', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('close-window', () => {
        mainWindow.close();
    });

    ipcMain.on('set-fullscreen', (_, isFullScreen) => {
        mainWindow.setFullScreen(isFullScreen); 
        mainWindow.webContents.send('hide-controls', isFullScreen);  
    });
}

function openSelectSubjectDialog() {
    const selectSubjectWindow = new BrowserWindow({
        width: 800,
        height: 600,
        modal: true,
        frame: false,
        parent: mainWindow,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    selectSubjectWindow.loadFile('pages/select-subject.html');

    const closeHandler = (_, action) => {
        if (selectSubjectWindow && !selectSubjectWindow.isDestroyed()) {
            mainWindow.webContents.send('second-window-closed', action);
            selectSubjectWindow.close();
        }
    };

    // Register the listener for this window instance
    ipcMain.once('close-select-subject-window', closeHandler);

    // When the window is closed, remove the listener to avoid referencing a destroyed window
    selectSubjectWindow.on('closed', () => {
        ipcMain.removeListener('close-select-subject-window', closeHandler);
    });

    // Adjust size after content loads
    // selectSubjectWindow.webContents.once('did-finish-load', () => {
    //     selectSubjectWindow.webContents
    //         .executeJavaScript(`
    //         new Promise((resolve) => {
    //             const { scrollWidth, scrollHeight } = document.documentElement;
    //             resolve({ width: scrollWidth, height: scrollHeight });
    //         });
    //     `)
    //         .then((size) => {
    //             selectSubjectWindow.setBounds({
    //                 width: Math.min(size.width + 20, 800), // Limit max width
    //                 height: Math.min(size.height + 20, 600), // Limit max height
    //             });
    //         });
    // });
}

function openCongratsWindow() {
    const congratsWindow = new BrowserWindow({
        width: 450,
        height: 500,
        frame: false,
        modal: true,
        transparent: true,
        parent: mainWindow,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    congratsWindow.loadFile('pages/congrats.html');

    const closeHandler = (_, action) => {
        if (congratsWindow && !congratsWindow.isDestroyed()) {
            mainWindow.webContents.send('congrats-window-closed', action);
            congratsWindow.close();
        }
    };

    // Register the listener for this window instance
    ipcMain.once('close-congrats-window', closeHandler);

    // When the window is closed, remove the listener to avoid referencing a destroyed window
    congratsWindow.on('closed', () => {
        ipcMain.removeListener('close-congrats-window', closeHandler);
        mainWindow.webContents.send('show-controls', true);
    });
}

// IPC handlers for opening windows
ipcMain.on('open-subject-window', () => {
    openSelectSubjectDialog();
});

ipcMain.on('open-congrats-window', () => {
    openCongratsWindow();
});

// IPC handler for fetching questions
ipcMain.handle('get-questions-by-subject', (_, subject, year) => {
    try {
        const stmt = db.prepare(`SELECT * FROM questions WHERE subject = ? AND year = ? ORDER BY RANDOM() LIMIT 50;`);
        const questions = stmt.all(subject, year);

        questions.forEach(q => {
            if (q.options) {
                q.options = JSON.parse(q.options);
            }
        });
        return questions;
    } catch (error) {
        console.error('Error retrieving questions:', error);
        throw error;
    }
});

// App event handlers
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
