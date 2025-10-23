# setup-electron.ps1
# Script para configurar o ambiente de desenvolvimento Electron

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    CONFIGURACAO DO ELECTRON" -ForegroundColor Cyan
Write-Host "    Sistema CIVITAS - Cartorio Digital" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "1. Verificando instalacao do Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    
    # Verificar se a versão é adequada (16+)
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 16) {
        Write-Host "⚠️ Versao do Node.js muito antiga. Recomendado: 16 ou superior." -ForegroundColor DarkYellow
        Write-Host "   Download: https://nodejs.org/" -ForegroundColor DarkYellow
    }
} catch {
    Write-Host "❌ Node.js nao encontrado. Por favor, instale Node.js 16 ou superior." -ForegroundColor Red
    Write-Host "   Download: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit 1
}

# 2. Verificar npm
Write-Host "`n2. Verificando instalacao do npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm nao encontrado." -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit 1
}

# 3. Instalar Electron globalmente
Write-Host "`n3. Instalando Electron globalmente..." -ForegroundColor Yellow
try {
    npm install -g electron electron-builder
    Write-Host "✅ Electron instalado globalmente." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao instalar Electron globalmente. Tentando continuar..." -ForegroundColor DarkYellow
}

# 4. Instalar dependências do projeto
Write-Host "`n4. Instalando dependencias do projeto..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencias do projeto instaladas." -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependencias do projeto." -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit 1
}

# 5. Instalar dependências do Electron
Write-Host "`n5. Instalando dependencias do Electron..." -ForegroundColor Yellow
try {
    cd electron
    npm install
    cd ..
    Write-Host "✅ Dependencias do Electron instaladas." -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependencias do Electron." -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit 1
}

# 6. Verificar Python (para OCR)
Write-Host "`n6. Verificando instalacao do Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
    
    # Instalar dependências Python
    Write-Host "   Instalando dependencias Python..." -ForegroundColor Yellow
    python -m pip install pytesseract pillow opencv-python numpy
    Write-Host "✅ Dependencias Python instaladas." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Python nao encontrado ou erro ao instalar dependencias." -ForegroundColor DarkYellow
    Write-Host "   Para funcionalidade OCR completa, instale Python 3.x." -ForegroundColor DarkYellow
    Write-Host "   Download: https://www.python.org/downloads/" -ForegroundColor DarkYellow
}

# 7. Verificar Tesseract
Write-Host "`n7. Verificando instalacao do Tesseract-OCR..." -ForegroundColor Yellow
try {
    $tesseractPath = Get-Command tesseract.exe -ErrorAction Stop | Select-Object -ExpandProperty Source
    Write-Host "✅ Tesseract-OCR encontrado em: $tesseractPath" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Tesseract-OCR nao encontrado." -ForegroundColor DarkYellow
    Write-Host "   Para funcionalidade OCR completa, instale Tesseract-OCR." -ForegroundColor DarkYellow
    Write-Host "   Download: https://tesseract-ocr.github.io/tessdoc/Downloads.html" -ForegroundColor DarkYellow
    Write-Host "   Certifique-se de instalar o pacote de idioma 'Portuguese'." -ForegroundColor DarkYellow
}

# 8. Verificar drivers de scanner
Write-Host "`n8. Informacoes sobre drivers de scanner..." -ForegroundColor Yellow
Write-Host "   Para acesso completo a scanners e impressoras multifuncionais:" -ForegroundColor White
Write-Host "   • Instale os drivers TWAIN do fabricante do seu scanner" -ForegroundColor White
Write-Host "   • Para impressoras multifuncionais, instale os drivers completos" -ForegroundColor White
Write-Host "   • Verifique se o dispositivo e reconhecido pelo sistema operacional" -ForegroundColor White

# 9. Testar instalação
Write-Host "`n9. Testando instalacao do Electron..." -ForegroundColor Yellow
try {
    cd electron
    $testResult = npm run start --dry-run
    cd ..
    Write-Host "✅ Electron configurado corretamente." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao testar Electron. Verifique as dependencias." -ForegroundColor DarkYellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "    CONFIGURACAO CONCLUIDA!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar o desenvolvimento:" -ForegroundColor Green
Write-Host "  npm run dev:electron    # Modo desenvolvimento" -ForegroundColor White
Write-Host "  npm run start:electron  # Modo producao" -ForegroundColor White
Write-Host "  npm run build:electron  # Construir aplicacao" -ForegroundColor White
Write-Host ""
Write-Host "Para construir executavel:" -ForegroundColor Green
Write-Host "  npm run dist:electron   # Gerar instalador" -ForegroundColor White
Write-Host ""
Write-Host "Aplicacao Electron permitira acesso completo a:" -ForegroundColor Green
Write-Host "  • Scanners via TWAIN/SANE" -ForegroundColor White
Write-Host "  • Impressoras multifuncionais" -ForegroundColor White
Write-Host "  • Configuracoes avancadas de qualidade" -ForegroundColor White
Write-Host "  • APIs nativas do sistema operacional" -ForegroundColor White
Write-Host ""
Read-Host "Pressione Enter para continuar..."
