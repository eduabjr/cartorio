const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Criar a janela do navegador
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Carregar a aplicação
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Mostrar a janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Configurar o menu da aplicação
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Sair',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar Recarregamento' },
        { role: 'toggleDevTools', label: 'Ferramentas do Desenvolvedor' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Padrão' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' }
      ]
    },
    {
      label: 'Janela',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Fechar' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre o Sistema de Cartório',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre',
              message: 'Sistema de Cartório',
              detail: 'Sistema de gestão para cartórios\nVersão 1.0.0'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  return mainWindow;
}

// Este método será chamado quando o Electron terminar de inicializar
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Sair quando todas as janelas estiverem fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Configurações de segurança
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
