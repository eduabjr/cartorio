const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// ╔════════════════════════════════════════════════════════════════╗
// ║  CICLO DE 4 ESTADOS (1 clique = 1 mudança)                     ║
// ║  1. normal     → Tamanho padrão (1200x800)                    ║
// ║  2. minimized  → Tamanho reduzido (900x600)                   ║
// ║  3. extended   → Segunda tela OU maximizado (sem 2ª tela)     ║
// ║  4. VOLTA → normal (ciclo fecha)                              ║
// ╚════════════════════════════════════════════════════════════════╝

let windowState = 'normal';
let savedNormalBounds = { x: 100, y: 100, width: 1200, height: 800 }; // Posição inicial
let mainWindow = null;
let isProcessing = false; // Proteção contra cliques rápidos

function createWindow() {
  // Criar a janela do navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    frame: false,
    transparent: false,
    hasShadow: true,
    show: false,
    backgroundColor: '#1a5c3a'
  });

  // Carregar a aplicação
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Remover menu nativo completamente
  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);

  // Mostrar a janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Eventos de maximização/restauração
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized');
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

  // Menu removido - controles customizados no React
  // const menu = Menu.buildFromTemplate(template);
  // Menu.setApplicationMenu(menu);

  return mainWindow;
}

// IPC Handlers - Registrados UMA ÚNICA VEZ (fora do createWindow)
// Handler para obter o estado atual
ipcMain.handle('get-window-state', () => {
  console.log('📡 React solicitou estado atual:', windowState);
  return windowState;
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize', () => {
  if (!mainWindow) {
    console.log('❌ Janela não existe');
    return;
  }
  
  // ⛔ PROTEÇÃO: Bloquear cliques múltiplos rápidos
  if (isProcessing) {
    console.log('⏸️  CLIQUE IGNORADO - Processamento em andamento...');
    return;
  }
  
  isProcessing = true;
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖱️  CLIQUE ÚNICO RECEBIDO');
  console.log('📊 Estado ANTES:', windowState);
  console.log('📍 savedNormalBounds atual:', savedNormalBounds);
  
  try {
    const displays = screen.getAllDisplays();
    const primaryDisplay = displays[0];
    const currentBounds = mainWindow.getBounds();
    
    console.log('🖥️  Monitores disponíveis:', displays.length);
    
    // ╔═══════════════════════════════════════════════════════════╗
    // ║  CICLO: Normal → Reduzido → Estendido → Normal (repete)  ║
    // ╚═══════════════════════════════════════════════════════════╝
    
    if (windowState === 'normal') {
      // ━━━ PASSO 1/4: Normal → Reduzido ━━━
      console.log('🔵 PASSO 1: Normal (1200x800) → Reduzido (900x600)');
      
      // Salvar posição normal atual
      savedNormalBounds = { ...currentBounds };
      console.log('💾 Posição normal salva:', savedNormalBounds);
      
      // Centralizar janela reduzida
      const centerX = primaryDisplay.bounds.x + (primaryDisplay.bounds.width - 900) / 2;
      const centerY = primaryDisplay.bounds.y + (primaryDisplay.bounds.height - 600) / 2;
      
      mainWindow.setBounds({
        x: Math.floor(centerX),
        y: Math.floor(centerY),
        width: 900,
        height: 600
      });
      
      // MUDAR ESTADO IMEDIATAMENTE
      windowState = 'minimized';
      mainWindow.webContents.send('window-state-changed', 'minimized');
      
      console.log('✅ Mudou para: REDUZIDO (900x600)');
      
    } else if (windowState === 'minimized') {
      // ━━━ PASSO 2/4: Reduzido → Estendido ━━━
      console.log('🟢 PASSO 2: Reduzido (900x600) → Estendido (2ª tela OU maximizado)');
      
      // MUDAR ESTADO IMEDIATAMENTE
      windowState = 'extended';
      
      if (displays.length > 1) {
        // Há segunda tela: estender para ela
        const secondDisplay = displays[1];
        console.log('📺 Estendendo para 2ª tela:', secondDisplay.bounds);
        
        mainWindow.setBounds({
          x: secondDisplay.bounds.x,
          y: secondDisplay.bounds.y,
          width: secondDisplay.bounds.width,
          height: secondDisplay.bounds.height
        });
        
        setTimeout(() => mainWindow.maximize(), 50);
        
      } else {
        // Sem segunda tela: maximizar na tela principal
        console.log('📺 Sem 2ª tela - Maximizando na tela principal');
        mainWindow.maximize();
      }
      
      mainWindow.webContents.send('window-state-changed', 'extended');
      console.log('✅ Mudou para: ESTENDIDO');
      
    } else if (windowState === 'extended') {
      // ━━━ PASSO 3/4: Estendido → Normal (FECHA O CICLO) ━━━
      console.log('🟡 PASSO 3: Estendido → Normal (VOLTA AO INÍCIO)');
      console.log('🔙 Restaurando posição normal salva:', savedNormalBounds);
      
      mainWindow.unmaximize();
      
      // IMPORTANTE: Mudar estado IMEDIATAMENTE
      windowState = 'normal';
      
      // Validar savedNormalBounds
      const boundsToRestore = {
        x: savedNormalBounds.x || 100,
        y: savedNormalBounds.y || 100,
        width: savedNormalBounds.width || 1200,
        height: savedNormalBounds.height || 800
      };
      
      console.log('🔧 Aplicando bounds:', boundsToRestore);
      
      setTimeout(() => {
        mainWindow.setBounds(boundsToRestore);
        mainWindow.webContents.send('window-state-changed', 'normal');
        console.log('✅ Mudou para: NORMAL');
        console.log('🎉 CICLO COMPLETO! Estado atual:', windowState);
      }, 100);
      
    } else {
      // Estado inesperado - resetar para normal
      console.error('❌ ESTADO INESPERADO:', windowState);
      console.log('🔄 Resetando para NORMAL...');
      windowState = 'normal';
      mainWindow.webContents.send('window-state-changed', 'normal');
    }
    
    console.log('📊 Estado DEPOIS:', windowState);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ ERRO no ciclo:', error);
    windowState = 'normal';
    mainWindow.webContents.send('window-state-changed', 'normal');
  } finally {
    // Liberar após 250ms para evitar cliques duplos
    setTimeout(() => {
      isProcessing = false;
      console.log('🔓 Pronto para próximo clique\n');
    }, 250);
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

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
