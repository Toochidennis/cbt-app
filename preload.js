const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('api', {
    openLink: (url) => ipcRenderer.send('open-link', url),
    getQuestions: (subject, year) => ipcRenderer.invoke('get-questions-by-subject', subject, year),
    navigate: (page) => ipcRenderer.send('navigate', page),
    minimize: () => ipcRenderer.send("minimize-window"),
    maximize: () => ipcRenderer.send("maximize-window"),
    close: () => ipcRenderer.send("close-window"),
    closeSelectSubjectWindow: (action) => ipcRenderer.send("close-select-subject-window", action),
    onMaximized: (callback) => ipcRenderer.on("window-maximized", callback),
    onRestored: (callback) => ipcRenderer.on("window-restored", callback),
    openSelectSubjectWindow: () => ipcRenderer.send('open-subject-window'),
    sendExamResults: (summaryData) => ipcRenderer.send("send-exam-results", summaryData),
    onSecondWindowClosed: (callback) => ipcRenderer.on('second-window-closed', callback),
    onCongratsWindowClosed: (callback) => ipcRenderer.on('congrats-window-closed', callback),
 //   hideSummaryPage: () => ipcRenderer.send('hide-summary-page'),
    closeCongratsWindow: () => ipcRenderer.send('close-congrats-window'),
    setFullScreen: (isFullScreen) => ipcRenderer.send('set-fullscreen', isFullScreen),
    hideControls: (isHide) => ipcRenderer.on('hide-controls', isHide),
    showControls: (isShow) => ipcRenderer.on('show-controls', isShow),
    getExamSummary: (summaryData) => ipcRenderer.on('get-exam-summary', summaryData),
    getActivationState: () => ipcRenderer.invoke('get-activation-state'),
    validateActivationOnline: (activationCode) => ipcRenderer.invoke('validate-activation-online', activationCode),
    validateActivationOffline: (activationCode, hash) => ipcRenderer.invoke('validate-activation-offline', activationCode, hash),
    openActivationWindow: () => ipcRenderer.send('open-activation-window'),
    closeActivationWindow: () => ipcRenderer.send('close-activation-window'),
    generateProductKey: (productKey) => ipcRenderer.invoke('generate-product-key', productKey),
    getImagePath: (subject, imageFileName) => ipcRenderer.invoke('get-image-path', subject, imageFileName),
});
