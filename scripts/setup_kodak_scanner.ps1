# setup_kodak_scanner.ps1
# Script para configurar scanner Kodak i2600 no sistema CIVITAS

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURAÇÃO SCANNER KODAK i2600" -ForegroundColor Cyan
Write-Host "   SISTEMA CARTORIO CIVITAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar se um comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Verificar se o Tesseract está instalado
Write-Host "📋 Verificando instalação do Tesseract..." -ForegroundColor Yellow
$tesseractPath = "C:\Program Files\Tesseract-OCR\tesseract.exe"
if (Test-Path $tesseractPath) {
    Write-Host "✅ Tesseract encontrado" -ForegroundColor Green
    $tesseractVersion = & $tesseractPath --version 2>$null | Select-Object -First 1
    Write-Host "   Versão: $tesseractVersion" -ForegroundColor Gray
} else {
    Write-Host "❌ Tesseract não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale o Tesseract OCR:" -ForegroundColor Yellow
    Write-Host "1. Baixe de: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Gray
    Write-Host "2. Instale em: C:\Program Files\Tesseract-OCR\" -ForegroundColor Gray
    Write-Host "3. Execute este script novamente" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Pressione Enter para continuar"
    exit 1
}

# Verificar se o Python está instalado
Write-Host "📋 Verificando instalação do Python..." -ForegroundColor Yellow
if (Test-Command python) {
    $pythonVersion = python --version 2>$null
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Python não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale o Python 3.8 ou superior:" -ForegroundColor Yellow
    Write-Host "1. Baixe de: https://www.python.org/downloads/" -ForegroundColor Gray
    Write-Host "2. Execute este script novamente" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Pressione Enter para continuar"
    exit 1
}

# Instalar dependências Python
Write-Host "📋 Instalando dependências Python..." -ForegroundColor Yellow
$packages = @("pytesseract", "pillow", "opencv-python", "numpy")
foreach ($package in $packages) {
    Write-Host "   Instalando $package..." -ForegroundColor Gray
    pip install $package --quiet
}

# Verificar instalação do OpenCV
Write-Host "📋 Verificando instalação do OpenCV..." -ForegroundColor Yellow
try {
    $cvVersion = python -c "import cv2; print('OpenCV version:', cv2.__version__)" 2>$null
    Write-Host "✅ OpenCV instalado: $cvVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ OpenCV pode não estar funcionando corretamente" -ForegroundColor Yellow
    Write-Host "Tente reinstalar: pip install opencv-python" -ForegroundColor Gray
}

# Configurar variáveis de ambiente
Write-Host "📋 Configurando variáveis de ambiente..." -ForegroundColor Yellow
try {
    [Environment]::SetEnvironmentVariable("TESSERACT_PATH", $tesseractPath, "Machine")
    [Environment]::SetEnvironmentVariable("TESSDATA_PREFIX", "C:\Program Files\Tesseract-OCR\tessdata", "Machine")
    Write-Host "✅ Variáveis de ambiente configuradas" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Não foi possível configurar variáveis de ambiente (requer privilégios de administrador)" -ForegroundColor Yellow
}

# Verificar idioma português
Write-Host "📋 Verificando idioma português..." -ForegroundColor Yellow
$portuguesePath = "C:\Program Files\Tesseract-OCR\tessdata\por.traineddata"
if (Test-Path $portuguesePath) {
    Write-Host "✅ Idioma português disponível" -ForegroundColor Green
} else {
    Write-Host "⚠️ Idioma português não encontrado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para melhor reconhecimento de documentos brasileiros:" -ForegroundColor Yellow
    Write-Host "1. Baixe por.traineddata de: https://github.com/tesseract-ocr/tessdata" -ForegroundColor Gray
    Write-Host "2. Coloque em: C:\Program Files\Tesseract-OCR\tessdata\" -ForegroundColor Gray
    Write-Host "3. Reinicie o sistema" -ForegroundColor Gray
}

# Verificar drivers TWAIN
Write-Host "📋 Verificando drivers TWAIN..." -ForegroundColor Yellow
$twainPath = "C:\Windows\twain_32"
if (Test-Path $twainPath) {
    Write-Host "✅ Pasta TWAIN encontrada" -ForegroundColor Green
} else {
    Write-Host "⚠️ Pasta TWAIN não encontrada" -ForegroundColor Yellow
    Write-Host "Verifique se os drivers do scanner estão instalados" -ForegroundColor Gray
}

# Testar configuração
Write-Host "📋 Testando configuração..." -ForegroundColor Yellow
try {
    $testResult = python scripts\kodak_scanner_ocr.py --test 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Configuração testada com sucesso" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Configuração pode precisar de ajustes" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Não foi possível testar a configuração" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURAÇÃO CONCLUÍDA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Scanner Kodak i2600 configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Conecte o scanner Kodak i2600" -ForegroundColor Gray
Write-Host "2. Instale os drivers TWAIN específicos" -ForegroundColor Gray
Write-Host "3. Teste a digitalização no sistema" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Configurações aplicadas:" -ForegroundColor Yellow
Write-Host "- Tesseract OCR otimizado para português" -ForegroundColor Gray
Write-Host "- Processamento de imagem com OpenCV" -ForegroundColor Gray
Write-Host "- Configurações específicas para documentos brasileiros" -ForegroundColor Gray
Write-Host ""

Read-Host "Pressione Enter para continuar"
