const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
require('./renderer/question');
const QuestionModel = require('./models/QuestionModel');
const ActivationModel = require('./models/ActivationModel');
const getImagePath = require('./renderer/image_loader');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

const gotTheLock = app.requestSingleInstanceLock();

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit',
    });
}

let mainWindow;
let learnCourseWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
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

    // ipcMain.on('set-fullscreen', (_, isFullScreen) => {
    //     mainWindow.setFullScreen(isFullScreen);
    //     mainWindow.webContents.send('hide-controls', isFullScreen);
    // });

    ipcMain.on('open-link', (_, url) => {
        shell.openExternal(url);
    });
}

function openActivationWindow() {
    const activationWindow = new BrowserWindow({
        frame: false,
        modal: true,
        parent: mainWindow,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
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
        }
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

function openExamWindow(examData) {
    const examWindow = new BrowserWindow({
        modal: true,
        frame: false,
        parent: mainWindow,
        webPreferences: {
            contextIsolation: true,
            devTools: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    examWindow.setFullScreen(true);
    examWindow.loadFile('pages/cbt.html').then(() => {
        examWindow.webContents.send('start-exam', examData);
    });

    examWindow.webContents.on('devtools-opened', () => {
        examWindow.webContents.closeDevTools();
    });

    ipcMain.once('send-exam-results', (_, summaryData) => {
        examWindow.webContents.send('get-exam-summary', summaryData);
    });

    // Register the listener for this window instance
    ipcMain.once('close-exam-window', () => {
        examWindow.close();
    });
}

function openLearnCourseWindow() {
    learnCourseWindow = new BrowserWindow({
        modal: true,
        frame: false,
        parent: mainWindow,
        webPreferences: {
            contextIsolation: true,
            //    devTools: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    learnCourseWindow.maximize();
    learnCourseWindow.loadFile('pages/learn-course.html');

    const closeHandler = () => {
        if (learnCourseWindow && !learnCourseWindow.isDestroyed()) {
            learnCourseWindow.close();
        }
    };

    // Register the listener for this window instance
    ipcMain.once('close-learn-course-window', closeHandler);

    // When the window is closed, remove the listener to avoid referencing a destroyed window
    learnCourseWindow.on('closed', () => {
        ipcMain.removeListener('close-learn-course-window', closeHandler);
    });
}

ipcMain.on('open-quiz-window', () => {
    const quizWindow = new BrowserWindow({
        modal: true,
        frame: false,
        parent: learnCourseWindow,
        webPreferences: {
            contextIsolation: true,
            devTools: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    quizWindow.maximize();
    // Enjoyment allowance
    quizWindow.loadFile('pages/quiz.html');

    const closeHandler = (_, lessonId) => {
        if (quizWindow && !quizWindow.isDestroyed()) {
            learnCourseWindow.webContents.send('send-quiz-result', lessonId);
            quizWindow.close();
        }
    };

    // Register the listener for this window instance
    ipcMain.once('close-quiz-window', closeHandler);

    // When the window is closed, remove the listener to avoid referencing a destroyed window
    quizWindow.on('closed', () => {
        ipcMain.removeListener('close-quiz-window', closeHandler);
    });
});


ipcMain.handle('generate-certificate-pdf', async (_, name, courseId, courseName) => {
    const certCountPath = path.join(app.getPath('userData'), 'certCount.json');

    // Load or create cert count file
    let certCounts = {};
    if (fs.existsSync(certCountPath)) {
        certCounts = JSON.parse(fs.readFileSync(certCountPath));
    }

    if ((certCounts[courseId] || 0) >= 4) {
        await dialog.showMessageBox({
            type: 'info',
            title: 'Certificate Request',
            message: 'Certificate limit reached for this course.',
            buttons: ['OK']
        });

        certWindow.close();

        return { err: 'Certificate limit reached for this course' };
    }

    const certWindow = new BrowserWindow({
        width: 1123,
        height: 794,
        show: false,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    await certWindow.loadFile('pages/certificate.html');
    certWindow.webContents.send('set-name', name, courseId);

    // Wait for the 'pdf-generated' event and resolve when it's triggered
    const pdfBuffer = await new Promise(resolve => {
        ipcMain.once('pdf-generated', (_, buffer) => {
            resolve(buffer);
        });
    });

    const filePath = path.join(app.getPath('downloads'), `${name}_${courseName}_certificate.pdf`);
    fs.writeFileSync(filePath, pdfBuffer);

    await dialog.showMessageBox({
        type: 'info',
        title: 'PDF Generated',
        message: 'The certificate has been saved to your Downloads folder.',
        buttons: ['OK']
    });

    certCounts[courseId] = (certCounts[courseId] || 0) + 1;
    fs.writeFileSync(certCountPath, JSON.stringify(certCounts));

    certWindow.close();

    return { success: true, filePath };
});

// IPC handlers for opening windows
ipcMain.on('open-subject-window', () => {
    openSelectSubjectDialog();
});

ipcMain.on('open-activation-window', () => {
    openActivationWindow();
});

ipcMain.on('open-exam-window', (_, examData) => {
    openExamWindow(examData);
});

ipcMain.on('open-learn-course-window', (_, courseId) => {
    openLearnCourseWindow(courseId);
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
    return ActivationModel.isCbtActivated();
});

ipcMain.handle('validate-activation-online', async (_, activationCode) => {
    return ActivationModel.validateActivationOnline(activationCode);
});

ipcMain.handle('validate-activation-offline', async (_, activationCode, hash) => {
    return ActivationModel.validateActivationOffline(activationCode, hash);
});

ipcMain.handle('validate-course-activation', async (_, activationCode, categoryId, courseId) => {
    return ActivationModel.validateCourseActivationOnline(activationCode, categoryId, courseId);
});

ipcMain.handle('get-course-activation', async (_, categoryId, courseId) => {
    return ActivationModel.isCourseActivated(categoryId, courseId);
});

ipcMain.handle('generate-product-key', async () => {
    return ActivationModel.generateProductKey();
});

autoUpdater.on('update-available', () => {
    log.info('Update available');
});

autoUpdater.on('update-not-available', () => {
    log.info('No update available');
});

autoUpdater.on('error', (err) => {
    log.error('Error during update:', err);
});

autoUpdater.on("download-progress", (progress) => {
    log.info(`Download progress: ${progress.percent}%`);
});

autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded');
    dialog.showMessageBox({
        type: 'info',
        title: 'Update available',
        message: 'A new version has been downloaded. Restart the application to apply the updates.',
        buttons: ['Restart', 'Later']
    }).then(result => {
        if (result.response === 0) autoUpdater.quitAndInstall();
    });
});


if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
    });

    const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes

    app.whenReady().then(() => {
        // Check for updates on startup
        autoUpdater.checkForUpdates();

        // Periodic update check
        setInterval(() => {
            autoUpdater.checkForUpdates();
        }, UPDATE_INTERVAL);

        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
}