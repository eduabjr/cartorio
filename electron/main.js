// electron/main.js
// Processo principal do Electron para o Sistema CIVITAS

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

// Configurações da aplicação
const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

let mainWindow
let scannerBridge

// Função para criar a janela principal
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    frame: false, // Remove completamente o frame nativo
    transparent: false,
    hasShadow: true,
    backgroundColor: '#1a5c3a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
      devTools: isDev
    },
    icon: path.join(__dirname, '../frontend/public/logo-light.png'),
    title: 'Sistema CIVITAS - Cartório Digital',
    show: false,
    autoHideMenuBar: true,
    menuBarVisible: false
  })

  // Carregar a aplicação
  if (isDev) {
    // Modo desenvolvimento - carregar do servidor local
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // Modo produção - carregar arquivos estáticos
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'))
  }

  // Remover menu nativo completamente
  mainWindow.setMenu(null)
  mainWindow.setMenuBarVisibility(false)
  mainWindow.setAutoHideMenuBar(true)

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  // Eventos da janela
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Prevenir navegação externa
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    
    if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
      event.preventDefault()
    }
  })

  // Abrir links externos no navegador padrão
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  return mainWindow
}

// Inicializar aplicação
app.whenReady().then(() => {
  // Remover menu da aplicação completamente
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
  
  createMainWindow()
  
  // Inicializar bridge de scanner
  scannerBridge = require('./scanner-bridge')
  scannerBridge.initialize()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// Sair quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Configurações de segurança
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
    shell.openExternal(navigationUrl)
  })
})

// IPC Handlers para controles da janela
ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.close()
  }
})

// IPC Handlers para comunicação com o frontend
ipcMain.handle('detect-scanners', async () => {
  try {
    return await scannerBridge.detectScanners()
  } catch (error) {
    console.error('Erro ao detectar scanners:', error)
    throw error
  }
})

ipcMain.handle('scan-document', async (event, config) => {
  try {
    return await scannerBridge.scanDocument(config)
  } catch (error) {
    console.error('Erro ao digitalizar documento:', error)
    throw error
  }
})

ipcMain.handle('detect-multifunctional-printers', async () => {
  try {
    return await scannerBridge.detectMultifunctionalPrinters()
  } catch (error) {
    console.error('Erro ao detectar impressoras multifuncionais:', error)
    throw error
  }
})

ipcMain.handle('scan-with-multifunctional', async (event, config) => {
  try {
    return await scannerBridge.scanWithMultifunctional(config)
  } catch (error) {
    console.error('Erro ao digitalizar com multifuncional:', error)
    throw error
  }
})

ipcMain.handle('print-document', async (event, config) => {
  try {
    return await scannerBridge.printDocument(config)
  } catch (error) {
    console.error('Erro ao imprimir documento:', error)
    throw error
  }
})

ipcMain.handle('get-system-info', async () => {
  try {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome
    }
  } catch (error) {
    console.error('Erro ao obter informações do sistema:', error)
    throw error
  }
})

ipcMain.handle('show-message-box', async (event, options) => {
  try {
    const result = await dialog.showMessageBox(mainWindow, options)
    return result
  } catch (error) {
    console.error('Erro ao mostrar caixa de diálogo:', error)
    throw error
  }
})

ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, options)
    return result
  } catch (error) {
    console.error('Erro ao mostrar diálogo de salvar:', error)
    throw error
  }
})

ipcMain.handle('show-open-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, options)
    return result
  } catch (error) {
    console.error('Erro ao mostrar diálogo de abrir:', error)
    throw error
  }
})

// Configurações de segurança adicionais
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // Em desenvolvimento, ignorar erros de certificado
    event.preventDefault()
    callback(true)
  } else {
    // Em produção, usar comportamento padrão
    callback(false)
  }
})

// Configurações de protocolo de segurança
app.setAsDefaultProtocolClient('civitas')

// Configurações de atualização automática (se implementado)
if (isProd) {
  // Aqui você pode adicionar lógica de atualização automática
  // usando electron-updater ou similar
}

// Configurações de log
if (isProd) {
  // Configurar logging para produção
  const log = require('electron-log')
  log.transports.file.level = 'info'
  log.transports.console.level = 'info'
}

// Configurações de performance
app.commandLine.appendSwitch('--enable-gpu-rasterization')
app.commandLine.appendSwitch('--enable-zero-copy')
app.commandLine.appendSwitch('--ignore-gpu-blacklist')

// Configurações de segurança
app.commandLine.appendSwitch('--disable-web-security', '--disable-features', 'VizDisplayCompositor')

// Configurações de desenvolvimento
if (isDev) {
  app.commandLine.appendSwitch('--remote-debugging-port', '9222')
}

console.log('🚀 Sistema CIVITAS - Electron iniciado com sucesso!')
console.log(`📱 Modo: ${isDev ? 'Desenvolvimento' : 'Produção'}`)
console.log(`🖥️ Plataforma: ${process.platform}`)
console.log(`📦 Versão Electron: ${process.versions.electron}`)
