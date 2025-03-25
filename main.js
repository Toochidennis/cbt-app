const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
//const fs = require('fs').promises;
require('./renderer/question');
const QuestionModel = require('./models/QuestionModel');
const ActivationModel = require('./models/ActivationModel');
const getImagePath = require('./renderer/image_loader');
// const { generateKey } = require('crypto');

// const env = process.env.NODE_ENV || 'development';

// if (env === 'development') {
//     require('electron-reload')(__dirname, {
//         electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//         hardResetMethod: 'exit',
//     });
// }

let mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        // width: Math.min(1200, width * 0.8), // 80% of screen width or 1200px, whichever is smaller
        // height: Math.min(800, height * 0.8),
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

    ipcMain.on('send-exam-results', (_, summaryData) => {
        console.log(summaryData);
       mainWindow.webContents.send('get-exam-summary', summaryData);
    });
}

function openActivationWindow() {
    const activationWindow = new BrowserWindow({
        // width: 450,
        //  height: 700,
        frame: false,
        modal: true,
        parent: mainWindow,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    activationWindow.loadFile('pages/activation.html');

    const closeHandler = () => {
        if (activationWindow && !activationWindow.isDestroyed()) {
            activationWindow.close();
        }
    };

    // Register the listener for this window instance
    ipcMain.once('close-activation-window', closeHandler);

    // When the window is closed, remove the listener to avoid referencing a destroyed window
    activationWindow.on('closed', () => {
        ipcMain.removeListener('close-activation-window', closeHandler);
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
}

// IPC handlers for opening windows
ipcMain.on('open-subject-window', () => {
    openSelectSubjectDialog();
});

ipcMain.on('open-activation-window', () => {
    openActivationWindow();
});

// IPC handler for fetching questions
ipcMain.handle('get-questions-by-subject', (_, subject, year) => {
    try {
        return QuestionModel.find(subject, year);
    } catch (error) {
        console.error('Error retrieving questions:', error);
        throw error;
    }
});

ipcMain.handle('get-image-path', (_, subject, imageFileName) => {
    try {
        return getImagePath(subject, imageFileName);
    } catch (error) {
        console.error('Error retrieving image path:', error);
        throw error;
    }
});

// IPC handlers for activation state.
ipcMain.handle('get-activation-state', async () => {
    return ActivationModel.isActivated();
});

ipcMain.handle('validate-activation-online', async (_, activationCode) => {
    return ActivationModel.validateActivationOnline(activationCode);
});

ipcMain.handle('validate-activation-offline', async (_, activationCode, hash) => {
    return ActivationModel.validateActivationOffline(activationCode, hash);
});


ipcMain.handle('generate-product-key', async () => {
    return ActivationModel.generateProductKey();
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
