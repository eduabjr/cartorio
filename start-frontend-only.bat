@echo off
echo ========================================
echo   FRONTEND - DESENVOLVIMENTO LOCAL
echo ========================================
echo.

echo [1/2] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado! Instale o Node.js 18+.
    pause
    exit /b 1
)

echo [2/2] Iniciando frontend...
cd frontend
npm install
npm run dev

echo.
echo Frontend iniciado em: http://localhost:3000
pause

