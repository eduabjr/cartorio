@echo off
CHCP 65001 > NUL

REM ========================================================================
REM TODOS OS SCRIPTS .BAT CONSOLIDADOS - SISTEMA CARTÓRIO
REM Este arquivo consolida TODOS os scripts .bat do projeto
REM ========================================================================

echo.
echo ========================================================================
echo    TODOS OS SCRIPTS .BAT CONSOLIDADOS - SISTEMA CARTORIO
echo ========================================================================
echo.
echo Este arquivo consolida 3 scripts .bat:
echo   1. CONSOLIDATED-SCRIPTS.bat
echo   2. iniciar-servicos.bat
echo   3. TODOS-OS-SCRIPTS-BAT.bat (menu completo)
echo.
echo ========================================================================
echo.

:menu_principal
echo.
echo ========================================
echo   MENU PRINCIPAL
echo ========================================
echo.
echo [1] Iniciar Servicos (Microservicos)
echo [2] Menu Completo de Scripts
echo [3] Ver informacoes sobre scripts
echo [0] Sair
echo.
set /p choice="Digite sua opcao (0-3): "

if "%choice%"=="1" goto iniciar_servicos
if "%choice%"=="2" goto menu_completo
if "%choice%"=="3" goto info
if "%choice%"=="0" goto exit
goto menu_principal

:iniciar_servicos
echo.
echo ========================================
echo   INICIANDO SERVICOS (MICROSERVICOS)
echo ========================================
echo.
echo.
echo 1. Iniciando API Gateway (porta 3001)...
start "API Gateway" cmd /k "cd services\api-gateway && npm run start:dev"
echo.
echo 2. Iniciando Auth Service (porta 3002)...
start "Auth Service" cmd /k "cd services\auth-service && npm run dev"
echo.
echo 3. Iniciando User Service (porta 3003)...
start "User Service" cmd /k "cd services\user-service && npm run dev"
echo.
echo 4. Iniciando Frontend (porta 3000)...
start "Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo Todos os servicos foram iniciados!
echo Verifique as janelas que foram abertas.
pause
goto menu_principal

:menu_completo
REM Incluindo o menu completo do TODOS-OS-SCRIPTS-BAT.bat
echo.
echo ========================================
echo   MENU COMPLETO - SCRIPTS CONSOLIDADOS
echo ========================================
echo.
echo [1] Frontend Simples
echo [2] Frontend com Porta Fixa (3000)
echo [3] Sistema OCR Completo
echo [4] Testar OCR
echo [5] Instalar Portugues (Tesseract)
echo [6] Copiar por.traineddata
echo [7] Scripts Automatizados (Menu Completo)
echo [8] Sistema de Protecao
echo [9] Voltar ao Menu Principal
echo [0] Sair
echo.
set /p subchoice="Digite sua opcao (0-9): "

if "%subchoice%"=="1" goto frontend_simples
if "%subchoice%"=="2" goto frontend_fixo
if "%subchoice%"=="3" goto ocr_completo
if "%subchoice%"=="4" goto testar_ocr
if "%subchoice%"=="5" goto instalar_portugues
if "%subchoice%"=="6" goto copiar_por
if "%subchoice%"=="7" goto scripts_automatizados
if "%subchoice%"=="8" goto sistema_protecao
if "%subchoice%"=="9" goto menu_principal
if "%subchoice%"=="0" goto exit
goto menu_completo

:frontend_simples
cd /d "%~dp0frontend"
call npm install
npm run dev
pause
goto menu_completo

:frontend_fixo
cd /d "%~dp0frontend"
npm run dev -- --port 3000 --strictPort
pause
goto menu_completo

:ocr_completo
"C:\Program Files\Tesseract-OCR\tesseract.exe" --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Tesseract nao encontrado!
    pause
    goto menu_completo
)
cd scripts
start "Servidor OCR" cmd /k "node ocr-server.js"
timeout /t 3 /nobreak >nul
cd ..\frontend
start "Frontend Civitas" cmd /k "npm run dev -- --port 3000 --strictPort"
echo Sistema OCR iniciado!
pause
goto menu_completo

:testar_ocr
"C:\Program Files\Tesseract-OCR\tesseract.exe" --version
cd frontend
npm run dev
pause
goto menu_completo

:instalar_portugues
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/tesseract-ocr/tessdata/raw/main/por.traineddata' -OutFile 'C:\Program Files\Tesseract-OCR\tessdata\por.traineddata'"
if %errorlevel% equ 0 (
    echo Instalado com sucesso!
) else (
    echo Erro! Execute como administrador.
)
pause
goto menu_completo

:copiar_por
copy "por.traineddata" "C:\Program Files\Tesseract-OCR\tessdata\"
pause
goto menu_completo

:scripts_automatizados
echo Use os scripts PowerShell para funcoes avancadas
echo Execute: .\iniciar-microservicos.ps1
pause
goto menu_completo

:sistema_protecao
echo Sistema de protecao de arquivos
if not exist "frontend\src\App.tsx.backup" (
    copy "frontend\src\App.tsx" "frontend\src\App.tsx.backup" > NUL
    echo Backup criado!
)
echo Sistema protegido!
pause
goto menu_completo

:info
echo.
echo ========================================
echo   INFORMACOES SOBRE SCRIPTS
echo ========================================
echo.
echo Este arquivo consolida todos os scripts .bat do projeto:
echo.
echo 1. CONSOLIDATED-SCRIPTS.bat
echo    - Menu de redirecionamento basico
echo.
echo 2. iniciar-servicos.bat
echo    - Inicia microservicos basicos
echo    - API Gateway, Auth, User, Frontend
echo.
echo 3. TODOS-OS-SCRIPTS-BAT.bat
echo    - Menu completo com todas funcionalidades
echo    - Frontend, OCR, XAMPP, Docker, etc
echo.
echo Recomendacao: Use os scripts PowerShell para microservicos!
echo    .\iniciar-microservicos.ps1
echo.
pause
goto menu_principal

:exit
echo.
echo Saindo...
exit /b 0

