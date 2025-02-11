const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getQuestions: (subject, year) => ipcRenderer.invoke('get-questions-by-subject', subject, year),
    navigate: (page) => ipcRenderer.send('navigate', page),
    minimize: () => ipcRenderer.send("minimize-window"),
    maximize: () => ipcRenderer.send("maximize-window"),
    close: () => ipcRenderer.send("close-window"),
    closeSelectSubjectWindow: (action) => ipcRenderer.send("close-select-subject-window", action),
    onMaximized: (callback) => ipcRenderer.on("window-maximized", callback),
    onRestored: (callback) => ipcRenderer.on("window-restored", callback),
    openSelectSubjectWindow: () => ipcRenderer.send('open-subject-window'),
    openCongratsWindow: () => ipcRenderer.send("open-congrats-window"),
    onSecondWindowClosed: (callback) => ipcRenderer.on('second-window-closed', callback),
    onCongratsWindowClosed: (callback) => ipcRenderer.on('congrats-window-closed', callback),
    closeCongratsWindow: () => ipcRenderer.send('close-congrats-window'),
});
