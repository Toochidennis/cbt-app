const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getQuestions: () => ipcRenderer.invoke('get-questions'),
    navigate: (page) => ipcRenderer.send('navigate', page),
    minimize: () => ipcRenderer.send("minimize-window"),
    maximize: () => ipcRenderer.send("maximize-window"),
    close: () => ipcRenderer.send("close-window"),
    closeSelectExamWindow: () => ipcRenderer.send("close-select-exam-window"),
    onMaximized: (callback) => ipcRenderer.on("window-maximized", callback),
    onRestored: (callback) => ipcRenderer.on("window-restored", callback),
    openSelectExamWindow: () => ipcRenderer.send('open-exam-window'),
    onSecondWindowClosed: (callback) => ipcRenderer.on('second-window-closed', callback),
});
