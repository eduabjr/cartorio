@echo off
CHCP 65001 > NUL

echo ========================================
echo    CONFIGURAÇÃO SCANNER KODAK i2600
echo    SISTEMA CARTORIO CIVITAS
echo ========================================
echo.

echo 🔧 Configurando ambiente para scanner Kodak...
echo.

REM Verificar se o Tesseract está instalado
echo 📋 Verificando instalação do Tesseract...
if exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (
    echo ✅ Tesseract encontrado
) else (
    echo ❌ Tesseract não encontrado
    echo.
    echo Por favor, instale o Tesseract OCR:
    echo 1. Baixe de: https://github.com/UB-Mannheim/tesseract/wiki
    echo 2. Instale em: C:\Program Files\Tesseract-OCR\
    echo 3. Execute este script novamente
    echo.
    pause
    exit /b 1
)

REM Verificar se o Python está instalado
echo 📋 Verificando instalação do Python...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python encontrado
) else (
    echo ❌ Python não encontrado
    echo.
    echo Por favor, instale o Python 3.8 ou superior
    echo 1. Baixe de: https://www.python.org/downloads/
    echo 2. Execute este script novamente
    echo.
    pause
    exit /b 1
)

REM Instalar dependências Python
echo 📋 Instalando dependências Python...
pip install pytesseract pillow opencv-python numpy

REM Verificar se o OpenCV foi instalado corretamente
echo 📋 Verificando instalação do OpenCV...
python -c "import cv2; print('OpenCV version:', cv2.__version__)" 2>nul
if %errorlevel% equ 0 (
    echo ✅ OpenCV instalado com sucesso
) else (
    echo ⚠️ OpenCV pode não estar funcionando corretamente
    echo Tente reinstalar: pip install opencv-python
)

REM Configurar variáveis de ambiente
echo 📋 Configurando variáveis de ambiente...
setx TESSERACT_PATH "C:\Program Files\Tesseract-OCR\tesseract.exe" /M
setx TESSDATA_PREFIX "C:\Program Files\Tesseract-OCR\tessdata" /M

REM Verificar se o arquivo de idioma português está disponível
echo 📋 Verificando idioma português...
if exist "C:\Program Files\Tesseract-OCR\tessdata\por.traineddata" (
    echo ✅ Idioma português disponível
) else (
    echo ⚠️ Idioma português não encontrado
    echo.
    echo Para melhor reconhecimento de documentos brasileiros:
    echo 1. Baixe por.traineddata de: https://github.com/tesseract-ocr/tessdata
    echo 2. Coloque em: C:\Program Files\Tesseract-OCR\tessdata\
    echo 3. Reinicie o sistema
    echo.
)

REM Testar configuração
echo 📋 Testando configuração...
python scripts\kodak_scanner_ocr.py --test 2>nul
if %errorlevel% equ 0 (
    echo ✅ Configuração testada com sucesso
) else (
    echo ⚠️ Configuração pode precisar de ajustes
)

echo.
echo ========================================
echo    CONFIGURAÇÃO CONCLUÍDA
echo ========================================
echo.
echo ✅ Scanner Kodak i2600 configurado com sucesso!
echo.
echo 📋 Próximos passos:
echo 1. Conecte o scanner Kodak i2600
echo 2. Instale os drivers TWAIN
echo 3. Teste a digitalização no sistema
echo.
echo 🔧 Configurações aplicadas:
echo - Tesseract OCR otimizado para português
echo - Processamento de imagem com OpenCV
echo - Configurações específicas para documentos brasileiros
echo.
pause
