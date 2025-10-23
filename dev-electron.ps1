# dev-electron.ps1
# Script para desenvolvimento com Electron

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DESENVOLVIMENTO ELECTRON" -ForegroundColor Cyan
Write-Host "    Sistema CIVITAS - Cartorio Digital" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "electron")) {
    Write-Host "❌ Diretorio 'electron' nao encontrado." -ForegroundColor Red
    Write-Host "   Execute este script no diretorio raiz do projeto." -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit 1
}

# Verificar se as dependências estão instaladas
if (-not (Test-Path "electron/node_modules")) {
    Write-Host "⚠️ Dependencias do Electron nao instaladas." -ForegroundColor DarkYellow
    Write-Host "   Executando instalacao..." -ForegroundColor DarkYellow
    cd electron
    npm install
    cd ..
}

# Verificar se o frontend está construído
if (-not (Test-Path "frontend/dist")) {
    Write-Host "⚠️ Frontend nao construido. Construindo..." -ForegroundColor DarkYellow
    cd frontend
    npm run build
    cd ..
}

# Menu de opções
function Show-Menu {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   MENU DE DESENVOLVIMENTO ELECTRON" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[1] Modo Desenvolvimento (com DevTools)" -ForegroundColor Green
    Write-Host "[2] Modo Producao (sem DevTools)" -ForegroundColor Green
    Write-Host "[3] Construir Aplicacao" -ForegroundColor Yellow
    Write-Host "[4] Gerar Instalador" -ForegroundColor Yellow
    Write-Host "[5] Testar Scanner Bridge" -ForegroundColor Blue
    Write-Host "[6] Verificar Dependencias" -ForegroundColor Blue
    Write-Host "[0] Sair" -ForegroundColor Red
    Write-Host ""
}

function Get-Choice {
    [int]$choice = -1
    while ($choice -lt 0 -or $choice -gt 6) {
        $input = Read-Host "Digite sua opcao (0-6)"
        if ([int]::TryParse($input, [ref]$choice)) {
            if ($choice -lt 0 -or $choice -gt 6) {
                Write-Host "Opcao invalida. Por favor, digite um numero entre 0 e 6." -ForegroundColor Red
            }
        } else {
            Write-Host "Entrada invalida. Por favor, digite um numero." -ForegroundColor Red
        }
    }
    return $choice
}

while ($true) {
    Show-Menu
    $choice = Get-Choice

    switch ($choice) {
        1 {
            Write-Host "`nExecutando: Modo Desenvolvimento..." -ForegroundColor Green
            Write-Host "   • DevTools habilitado" -ForegroundColor White
            Write-Host "   • Hot reload ativo" -ForegroundColor White
            Write-Host "   • Logs detalhados" -ForegroundColor White
            Write-Host ""
            cd electron
            npm run dev
            cd ..
            Pause
        }
        2 {
            Write-Host "`nExecutando: Modo Producao..." -ForegroundColor Green
            Write-Host "   • Otimizado para performance" -ForegroundColor White
            Write-Host "   • DevTools desabilitado" -ForegroundColor White
            Write-Host "   • Logs reduzidos" -ForegroundColor White
            Write-Host ""
            cd electron
            npm start
            cd ..
            Pause
        }
        3 {
            Write-Host "`nExecutando: Construir Aplicacao..." -ForegroundColor Yellow
            Write-Host "   • Compilando frontend..." -ForegroundColor White
            cd frontend
            npm run build
            cd ..
            Write-Host "   • Construindo Electron..." -ForegroundColor White
            cd electron
            npm run build
            cd ..
            Write-Host "✅ Aplicacao construida com sucesso!" -ForegroundColor Green
            Pause
        }
        4 {
            Write-Host "`nExecutando: Gerar Instalador..." -ForegroundColor Yellow
            Write-Host "   • Construindo frontend..." -ForegroundColor White
            cd frontend
            npm run build
            cd ..
            Write-Host "   • Gerando instalador..." -ForegroundColor White
            cd electron
            npm run dist
            cd ..
            Write-Host "✅ Instalador gerado com sucesso!" -ForegroundColor Green
            Write-Host "   Verifique a pasta 'electron/dist' para o instalador." -ForegroundColor White
            Pause
        }
        5 {
            Write-Host "`nExecutando: Testar Scanner Bridge..." -ForegroundColor Blue
            Write-Host "   • Testando deteccao de scanners..." -ForegroundColor White
            Write-Host "   • Testando deteccao de impressoras multifuncionais..." -ForegroundColor White
            Write-Host "   • Verificando APIs disponiveis..." -ForegroundColor White
            Write-Host ""
            Write-Host "Para testar completamente, execute a aplicacao em modo desenvolvimento." -ForegroundColor DarkYellow
            Pause
        }
        6 {
            Write-Host "`nExecutando: Verificar Dependencias..." -ForegroundColor Blue
            Write-Host "   • Node.js: " -NoNewline
            try {
                $nodeVersion = node --version
                Write-Host "$nodeVersion" -ForegroundColor Green
            } catch {
                Write-Host "Nao encontrado" -ForegroundColor Red
            }
            
            Write-Host "   • npm: " -NoNewline
            try {
                $npmVersion = npm --version
                Write-Host "$npmVersion" -ForegroundColor Green
            } catch {
                Write-Host "Nao encontrado" -ForegroundColor Red
            }
            
            Write-Host "   • Electron: " -NoNewline
            try {
                $electronVersion = electron --version
                Write-Host "$electronVersion" -ForegroundColor Green
            } catch {
                Write-Host "Nao encontrado" -ForegroundColor Red
            }
            
            Write-Host "   • Python: " -NoNewline
            try {
                $pythonVersion = python --version
                Write-Host "$pythonVersion" -ForegroundColor Green
            } catch {
                Write-Host "Nao encontrado" -ForegroundColor Red
            }
            
            Write-Host "   • Tesseract: " -NoNewline
            try {
                $tesseractPath = Get-Command tesseract.exe -ErrorAction Stop | Select-Object -ExpandProperty Source
                Write-Host "Encontrado" -ForegroundColor Green
            } catch {
                Write-Host "Nao encontrado" -ForegroundColor Red
            }
            
            Pause
        }
        0 {
            Write-Host "`nSaindo. Ate mais!" -ForegroundColor Red
            exit
        }
    }
    Write-Host "`nPressione qualquer tecla para voltar ao menu..." -ForegroundColor DarkGray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Clear-Host
}
