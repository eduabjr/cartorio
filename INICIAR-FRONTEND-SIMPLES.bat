@echo off
echo ========================================
echo   INICIANDO FRONTEND DO SISTEMA
echo ========================================
echo.

cd /d "%~dp0frontend"

echo Verificando se Node.js esta instalado...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

echo Node.js encontrado!
echo.

echo Instalando dependencias...
call npm install

echo.
echo Iniciando o servidor de desenvolvimento...
echo.
echo O frontend estara disponivel em: http://localhost:5173
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm run dev

pause
