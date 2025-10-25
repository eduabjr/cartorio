const { contextBridge, ipcRenderer } = require('electron');

// ╔══════════════════════════════════════════════════════════════╗
// ║  API Electron - Sistema de Ciclo de Janela                  ║
// ║  Estados: normal → minimized → extended → normal (repete)   ║
// ╚══════════════════════════════════════════════════════════════╝

contextBridge.exposeInMainWorld('electronAPI', {
  // Controles de janela
  minimizeWindow: () => {
    console.log('📡 [PRELOAD] minimizeWindow chamado');
    ipcRenderer.send('window-minimize');
  },
  maximizeWindow: () => {
    console.log('📡 [PRELOAD] maximizeWindow chamado - ENVIANDO PARA MAIN');
    ipcRenderer.send('window-maximize');
    console.log('📡 [PRELOAD] Mensagem window-maximize enviada!');
  },
  closeWindow: () => {
    console.log('📡 [PRELOAD] closeWindow chamado');
    ipcRenderer.send('window-close');
  },
  
  // Sistema de ciclo de estados - COM PROTEÇÃO contra duplicação
  onWindowStateChanged: (callback) => {
    // Remove TODOS os listeners antigos antes de adicionar novo
    ipcRenderer.removeAllListeners('window-state-changed');
    ipcRenderer.on('window-state-changed', (event, state) => {
      console.log('📡 Preload: Evento recebido do main →', state);
      callback(state);
    });
  },
  
  // Obter estado atual da janela (síncrono com o Electron)
  getWindowState: () => ipcRenderer.invoke('get-window-state')
});

