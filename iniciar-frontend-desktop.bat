@echo off
echo ========================================
echo   SISTEMA DE CARTORIO - DESKTOP APP
echo ========================================
echo.

echo [1/4] Navegando para o diretorio do frontend...
cd /d "F:\cartorio\frontend"

echo [2/4] Instalando dependencias...
call npm install

echo [3/4] Construindo o frontend...
call npm run build

echo [4/4] Iniciando aplicacao desktop...
echo.
echo A aplicacao desktop sera aberta em breve...
echo Para fechar, use o X da janela ou Alt+F4
echo.
call npm run electron

pause
