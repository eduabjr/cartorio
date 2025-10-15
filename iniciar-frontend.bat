@echo off
echo ========================================
echo   SISTEMA DE CARTORIO - FRONTEND
echo ========================================
echo.

echo [1/3] Navegando para o diretorio do frontend...
cd /d "F:\cartorio\frontend"

echo [2/3] Instalando dependencias...
call npm install

echo [3/3] Iniciando o frontend...
echo.
echo O frontend sera aberto em: http://localhost:5173
echo Para parar, pressione Ctrl+C
echo.
call npm run dev

pause
