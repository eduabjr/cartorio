// electron/preload.js
// Script de pré-carregamento para comunicação segura entre frontend e backend

const { contextBridge, ipcRenderer } = require('electron')

// Expor APIs seguras para o frontend
contextBridge.exposeInMainWorld('electronAPI', {
  // Window Control APIs
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // Scanner APIs
  detectScanners: () => ipcRenderer.invoke('detect-scanners'),
  scanDocument: (config) => ipcRenderer.invoke('scan-document', config),
  
  // Multifunctional Printer APIs
  detectMultifunctionalPrinters: () => ipcRenderer.invoke('detect-multifunctional-printers'),
  scanWithMultifunctional: (config) => ipcRenderer.invoke('scan-with-multifunctional', config),
  
  // Print APIs
  printDocument: (config) => ipcRenderer.invoke('print-document', config),
  
  // System APIs
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Dialog APIs
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Event listeners
  onScannerProgress: (callback) => {
    ipcRenderer.on('scanner-progress', callback)
  },
  onScannerComplete: (callback) => {
    ipcRenderer.on('scanner-complete', callback)
  },
  onScannerError: (callback) => {
    ipcRenderer.on('scanner-error', callback)
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  }
})

// Configurações de segurança
contextBridge.exposeInMainWorld('electronEnv', {
  platform: process.platform,
  isElectron: true,
  version: process.versions.electron
})

// Log de inicialização
console.log('🔒 Preload script carregado com segurança')
console.log('🌐 APIs do Electron expostas para o frontend')
console.log('🛡️ Context isolation ativado')
