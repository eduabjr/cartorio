@echo off
echo ========================================
echo  Sistema de Cartorio - Modo Desenvolvimento
echo ========================================
echo.

echo [1/3] Iniciando servicos Docker...
cd /d "%~dp0"
call docker-compose up -d

echo [2/3] Aguardando servicos iniciarem...
timeout /t 10 /nobreak >nul

echo [3/3] Iniciando aplicacao Electron...
cd /d "%~dp0frontend"
call npm run electron-dev

echo.
echo Pressione qualquer tecla para sair...
pause >nul
