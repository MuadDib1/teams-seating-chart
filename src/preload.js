const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('mainAPI', {
  openBrowserView: (url) => { 
    ipcRenderer.send('openBrowserView', url)
  }
})