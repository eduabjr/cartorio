@echo off
echo ========================================
echo    Sistema de Cartorio - Build Electron
echo ========================================
echo.

echo [1/4] Navegando para o diretorio do frontend...
cd /d "%~dp0frontend"

echo [2/4] Instalando dependencias do Electron...
call npm install electron electron-builder concurrently wait-on --save-dev

echo [3/4] Construindo a aplicacao React...
call npm run build

echo [4/4] Gerando o executavel...
call npm run electron-dist

echo.
echo ========================================
echo    Build concluido com sucesso!
echo ========================================
echo.
echo O executavel foi gerado em:
echo frontend\dist-electron\
echo.
echo Pressione qualquer tecla para sair...
pause >nul
