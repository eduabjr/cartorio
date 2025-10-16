@echo off
CHCP 65001 > NUL

echo ========================================
echo    SISTEMA DE PROTECAO ATIVADO
echo ========================================
echo.

echo 1. Verificando se o sistema esta funcionando...
echo.

REM Verificar se o App.tsx existe
if not exist "frontend\src\App.tsx" (
    echo ERRO: App.tsx nao encontrado!
    echo Restaurando do backup...
    goto :restore
)

REM Verificar se o backup existe
if not exist "frontend\src\App.tsx.backup" (
    echo Criando backup automatico...
    copy "frontend\src\App.tsx" "frontend\src\App.tsx.backup" > NUL
    echo Backup criado com sucesso!
)

echo Sistema verificado e protegido!
echo.
echo ========================================
echo    OPCOES DE PROTECAO DISPONIVEIS
echo ========================================
echo.
echo [1] Testar Sistema
echo [2] Restaurar Sistema (se quebrou)
echo [3] Criar Novo Backup
echo [4] Verificar Integridade
echo [5] Sair
echo.

:menu
set /p choice="Escolha uma opcao (1-5): "

if "%choice%"=="1" goto :test
if "%choice%"=="2" goto :restore
if "%choice%"=="3" goto :backup
if "%choice%"=="4" goto :check
if "%choice%"=="5" goto :exit

echo Opcao invalida! Tente novamente.
goto :menu

:test
echo.
echo Iniciando teste do sistema...
start cmd /k "cd frontend && npm run dev"
echo Sistema iniciado para teste!
goto :menu

:restore
echo.
echo ========================================
echo    RESTAURANDO SISTEMA
echo ========================================
echo.

if not exist "frontend\src\App.tsx.backup" (
    echo ERRO: Backup nao encontrado!
    echo Nao e possivel restaurar o sistema.
    pause
    goto :menu
)

echo Restaurando sistema do backup...
copy "frontend\src\App.tsx.backup" "frontend\src\App.tsx" > NUL

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    SISTEMA RESTAURADO COM SUCESSO!
    echo ========================================
    echo.
    echo O sistema foi restaurado para a versao funcional.
    echo Agora voce pode testar novamente.
    echo.
) else (
    echo.
    echo ERRO: Falha ao restaurar o sistema!
    echo Verifique as permissoes do arquivo.
    echo.
)
pause
goto :menu

:backup
echo.
echo Criando backup do sistema atual...
copy "frontend\src\App.tsx" "frontend\src\App.tsx.backup" > NUL

if %errorlevel% equ 0 (
    echo Backup criado com sucesso!
) else (
    echo ERRO: Falha ao criar backup!
)
pause
goto :menu

:check
echo.
echo ========================================
echo    VERIFICACAO DE INTEGRIDADE
echo ========================================
echo.

echo Verificando arquivos principais...

if exist "frontend\src\App.tsx" (
    echo ✓ App.tsx encontrado
) else (
    echo ✗ App.tsx NAO encontrado
)

if exist "frontend\src\App.tsx.backup" (
    echo ✓ Backup encontrado
) else (
    echo ✗ Backup NAO encontrado
)

if exist "frontend\src\components\ProtectedApp.tsx" (
    echo ✓ Sistema de protecao ativo
) else (
    echo ✗ Sistema de protecao NAO encontrado
)

if exist "frontend\src\main.tsx" (
    echo ✓ Main.tsx encontrado
) else (
    echo ✗ Main.tsx NAO encontrado
)

echo.
echo Verificacao concluida!
pause
goto :menu

:exit
echo.
echo Sistema de protecao encerrado.
echo O sistema esta protegido e pronto para uso.
echo.
pause
exit /b 0
