@echo off
echo ========================================
echo   SISTEMA DE CARTORIO - FRONTEND ESTAVEL
echo ========================================
echo.

echo [1/4] Navegando para o diretorio do frontend...
cd /d "F:\cartorio\frontend"

echo [2/4] Verificando se node_modules existe...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
) else (
    echo Dependencias ja instaladas.
)

echo [3/4] Verificando se o servidor ja esta rodando...
netstat -an | findstr :5173 >nul
if %errorlevel% == 0 (
    echo Servidor ja esta rodando na porta 5173
    echo Acesse: http://localhost:5173
    pause
    exit /b
)

echo [4/4] Iniciando o frontend de forma estavel...
echo.
echo O frontend sera aberto em: http://localhost:5173
echo Para parar, pressione Ctrl+C
echo.
echo Sistema configurado para ser consistente e nao cair!
echo.

call npm run dev

pause
