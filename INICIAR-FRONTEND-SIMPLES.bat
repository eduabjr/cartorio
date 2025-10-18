@echo off
CHCP 65001 > NUL

echo.
echo ========================================
echo    INICIANDO FRONTEND SIMPLES
echo ========================================
echo.

cd frontend

echo Instalando dependências...
npm install

echo.
echo Iniciando servidor de desenvolvimento...
echo O frontend estará disponível em: http://localhost:5173
echo.

npm run dev

pause