@echo off
CHCP 65001 > NUL

echo ========================================
echo    TODOS OS SCRIPTS .BAT CONSOLIDADOS
echo    SISTEMA CARTORIO CIVITAS
echo ========================================
echo.

echo Este arquivo contem todos os scripts .bat do projeto
echo Escolha a opcao desejada para executar
echo.

:menu
echo.
echo ========================================
echo   MENU PRINCIPAL - SCRIPTS CONSOLIDADOS
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
echo [0] Sair
echo.
set /p choice="Digite sua opcao (0-8): "

if "%choice%"=="1" goto frontend_simples
if "%choice%"=="2" goto frontend_fixo
if "%choice%"=="3" goto ocr_completo
if "%choice%"=="4" goto testar_ocr
if "%choice%"=="5" goto instalar_portugues
if "%choice%"=="6" goto copiar_por
if "%choice%"=="7" goto scripts_automatizados
if "%choice%"=="8" goto sistema_protecao
if "%choice%"=="0" goto exit
goto menu

:frontend_simples
echo.
echo ========================================
echo   FRONTEND SIMPLES
echo ========================================
echo.
echo [1/3] Navegando para o diretorio do frontend...
cd /d "%~dp0frontend"
echo [2/3] Instalando dependencias...
call npm install
echo [3/3] Iniciando o frontend...
echo.
echo O frontend sera aberto em: http://localhost:5173
echo Para parar, pressione Ctrl+C
echo.
call npm run dev
pause
goto menu

:frontend_fixo
echo.
echo ========================================
echo   FRONTEND COM PORTA FIXA (3000)
echo ========================================
echo.
echo [1/2] Navegando para o diretorio do frontend...
cd /d "%~dp0frontend"
echo [2/2] Iniciando servidor na porta 3000...
echo.
echo O frontend sera aberto em: http://localhost:3000
echo Para parar, pressione Ctrl+C
echo.
call npm run dev -- --port 3000 --strictPort
pause
goto menu

:ocr_completo
echo.
echo ========================================
echo   SISTEMA OCR COMPLETO
echo ========================================
echo.

echo [1/4] Verificando instalacao do Tesseract...
"C:\Program Files\Tesseract-OCR\tesseract.exe" --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Tesseract nao encontrado!
    echo Instale o Tesseract em: C:\Program Files\Tesseract-OCR\
    pause
    goto menu
)
echo OK: Tesseract encontrado!

echo.
echo [2/4] Verificando dependencias Python...
python -c "import pytesseract, PIL" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Dependencias Python nao encontradas!
    echo Execute: python -m pip install pytesseract pillow
    pause
    goto menu
)
echo OK: Dependencias Python encontradas!

echo.
echo [3/4] Iniciando servidor OCR...
cd scripts
start "Servidor OCR" cmd /k "node ocr-server.js"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Iniciando servidor frontend...
cd ..\frontend
start "Frontend Civitas" cmd /k "npm run dev -- --port 3000 --strictPort"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   SISTEMA OCR INICIADO COM SUCESSO!
echo ========================================
echo.
echo Servidores rodando:
echo - OCR API: http://localhost:3001
echo - Frontend: http://localhost:3000
echo.
echo Para testar o OCR:
echo 1. Acesse: http://localhost:3000
echo 2. Va para: Cadastro ^> Cliente
echo 3. Clique no icone da camera
echo 4. Selecione uma imagem de RG ou CNH
echo.
echo Pressione qualquer tecla para continuar...
pause >nul
goto menu

:testar_ocr
echo.
echo ========================================
echo   TESTE DO SISTEMA OCR - TESSERACT
echo ========================================
echo.

echo 1. Verificando instalacao do Tesseract...
"C:\Program Files\Tesseract-OCR\tesseract.exe" --version
echo.

echo 2. Iniciando servidor frontend...
echo    Acesse: http://localhost:3000
echo    Va para: Cadastro ^> Cliente
echo    Clique no icone da camera para testar OCR
echo.

cd frontend
npm run dev
pause
goto menu

:instalar_portugues
echo.
echo ========================================
echo   INSTALAR PORTUGUES (TESSERACT)
echo ========================================
echo.
echo Instalando pacote de idioma portugues brasileiro para Tesseract...
echo.

echo Baixando por.traineddata...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/tesseract-ocr/tessdata/raw/main/por.traineddata' -OutFile 'C:\Program Files\Tesseract-OCR\tessdata\por.traineddata'"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Arquivo por.traineddata instalado com sucesso!
    echo.
    echo Testando Tesseract com portugues...
    "C:\Program Files\Tesseract-OCR\tesseract.exe" --list-langs
) else (
    echo.
    echo ❌ Erro ao baixar o arquivo. Execute como administrador.
)

echo.
pause
goto menu

:copiar_por
echo.
echo ========================================
echo   COPIAR POR.TRAINEDDATA
echo ========================================
echo.
echo Copiando por.traineddata para o diretorio do Tesseract...
copy "por.traineddata" "C:\Program Files\Tesseract-OCR\tessdata\"
if %errorlevel% equ 0 (
    echo Arquivo copiado com sucesso!
) else (
    echo Erro ao copiar o arquivo. Execute como administrador.
)
pause
goto menu

:scripts_automatizados
echo.
echo ========================================
echo   SCRIPTS AUTOMATIZADOS (MENU COMPLETO)
echo ========================================
echo.
echo [1] Frontend Web (Desenvolvimento)
echo [2] Frontend Desktop (Electron)
echo [3] Gerar Executavel
echo [4] Frontend Estavel
echo [5] Configurar XAMPP
echo [6] Desenvolvimento Local
echo [7] Iniciar Todos os Servicos (XAMPP)
echo [8] Frontend com XAMPP
echo [9] Frontend com Docker
echo [10] Configurar Docker
echo [11] Frontend Simples
echo [0] Voltar ao Menu Principal
echo.
set /p subchoice="Digite sua opcao (0-11): "

if "%subchoice%"=="1" goto frontend_web
if "%subchoice%"=="2" goto frontend_desktop
if "%subchoice%"=="3" goto gerar_executavel
if "%subchoice%"=="4" goto frontend_estavel
if "%subchoice%"=="5" goto setup_xampp
if "%subchoice%"=="6" goto dev_local
if "%subchoice%"=="7" goto start_all_services
if "%subchoice%"=="8" goto frontend_xampp
if "%subchoice%"=="9" goto frontend_docker
if "%subchoice%"=="10" goto setup_docker
if "%subchoice%"=="11" goto frontend_simples_sub
if "%subchoice%"=="0" goto menu
goto scripts_automatizados

:frontend_web
echo.
echo ========================================
echo   FRONTEND WEB - DESENVOLVIMENTO
echo ========================================
echo.
echo [1/3] Navegando para o diretorio do frontend...
cd /d "%~dp0frontend"
echo [2/3] Instalando dependencias...
call npm install
echo [3/3] Iniciando o frontend...
echo.
echo O frontend sera aberto em: http://localhost:5173
echo Para parar, pressione Ctrl+C
echo.
call npm run dev
pause
goto scripts_automatizados

:frontend_desktop
echo.
echo ========================================
echo   SISTEMA DE CARTORIO - DESKTOP APP
echo ========================================
echo.
echo [1/4] Navegando para o diretorio do frontend...
cd /d "%~dp0frontend"
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
goto scripts_automatizados

:gerar_executavel
echo.
echo ========================================
echo   GERANDO EXECUTAVEL DO FRONTEND
echo ========================================
echo.
echo [1/4] Navegando para o diretorio do frontend...
cd /d "%~dp0frontend"
echo [2/4] Instalando dependencias...
call npm install
echo [3/4] Construindo o frontend...
call npm run build
echo [4/4] Gerando executavel...
echo.
echo O executavel sera criado na pasta: dist-electron
echo Este processo pode demorar alguns minutos...
echo.
call npm run electron-dist
echo.
echo ========================================
echo   EXECUTAVEL GERADO COM SUCESSO!
echo ========================================
echo.
echo O arquivo executavel foi criado em:
echo %~dp0frontend\dist-electron\
echo.
echo Procure por um arquivo .exe ou .msi
echo.
pause
goto scripts_automatizados

:frontend_estavel
echo.
echo ========================================
echo   SISTEMA DE CARTORIO - FRONTEND ESTAVEL
echo ========================================
echo.
echo [1/4] Navegando para o diretorio do frontend...
cd /d "%~dp0frontend"
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
    goto scripts_automatizados
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
goto scripts_automatizados

:setup_xampp
echo.
echo ========================================
echo    CONFIGURACAO DO PROJETO COM XAMPP
echo ========================================
echo.
echo [1/5] Verificando se o XAMPP esta instalado...
if not exist "C:\xampp\xampp-control.exe" (
    echo ERRO: XAMPP nao encontrado em C:\xampp\
    echo Por favor, instale o XAMPP primeiro: https://www.apachefriends.org/download.html
    pause
    goto scripts_automatizados
)
echo ✅ XAMPP encontrado!

echo.
echo [2/5] Criando configuração do Apache...
copy "frontend\xampp-config.conf" "C:\xampp\apache\conf\extra\frontend.conf" >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Nao foi possivel copiar automaticamente.
    echo Copie manualmente: frontend\xampp-config.conf para C:\xampp\apache\conf\extra\frontend.conf
) else (
    echo ✅ Configuração copiada!
)

echo.
echo [3/5] Configurando httpd.conf...
echo Adicionando Include para frontend.conf...
echo Include "conf/extra/frontend.conf" >> "C:\xampp\apache\conf\httpd.conf"
echo ✅ Configuração adicionada!

echo.
echo [4/5] Copiando arquivos .env de exemplo...
if not exist "env-examples" (
    echo ⚠️ Pasta env-examples nao encontrada! Pulando copia de .env...
) else (
    copy "env-examples\auth-service.env" "services\auth-service\.env" >nul 2>&1
    copy "env-examples\user-service.env" "services\user-service\.env" >nul 2>&1
    copy "env-examples\api-gateway.env" "services\api-gateway\.env" >nul 2>&1
    copy "env-examples\frontend.env" "frontend\.env" >nul 2>&1
    echo ✅ Arquivos .env copiados.
)

echo.
echo [5/5] Instalando dependencias...
echo Instalando dependencias do frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do frontend
    pause
    cd ..
    goto scripts_automatizados
)
cd ..

echo Instalando dependencias dos servicos...
for %%s in (auth-service user-service api-gateway) do (
    echo Instalando dependencias do %%s...
    cd services\%%s
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias do %%s
        pause
        cd ..\..
        goto scripts_automatizados
    )
    cd ..\..
)
echo ✅ Dependencias instaladas!

echo.
echo ========================================
echo    CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo PRÓXIMOS PASSOS:
echo.
echo 1. Abra o XAMPP Control Panel
echo 2. Inicie o Apache e MySQL
echo 3. Acesse http://localhost/phpmyadmin
echo 4. Crie os bancos de dados:
echo    - auth_db
echo    - user_db
echo    - cartorio_db
echo 5. Execute a opcao [7] Iniciar Todos os Servicos
echo.
echo ========================================
echo    ACESSOS:
echo ========================================
echo - Frontend: http://localhost:5173
echo - API Gateway: http://localhost:3000
echo - phpMyAdmin: http://localhost/phpmyadmin
echo - Apache: http://localhost
echo.
pause
goto scripts_automatizados

:dev_local
echo.
echo ========================================
echo   FRONTEND - DESENVOLVIMENTO LOCAL
echo ========================================
echo.
echo [1/2] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado! Instale o Node.js 18+.
    pause
    goto scripts_automatizados
)

echo [2/2] Iniciando frontend...
cd frontend
npm install
npm run dev

echo.
echo Frontend iniciado em: http://localhost:5173
pause
goto scripts_automatizados

:start_all_services
echo.
echo ========================================
echo   INICIANDO TODOS OS SERVICOS (XAMPP)
echo ========================================
echo.
echo [1/5] Verificando XAMPP...
if not exist "C:\xampp\xampp-control.exe" (
    echo ERRO: XAMPP nao encontrado em C:\xampp\
    echo Por favor, instale o XAMPP primeiro: https://www.apachefriends.org/download.html
    pause
    goto scripts_automatizados
)
echo ✅ XAMPP encontrado!

echo.
echo [2/5] Iniciando XAMPP...
start "" "C:\xampp\xampp-control.exe"
echo Aguarde 10 segundos para o XAMPP inicializar...
timeout /t 10 /nobreak >nul

echo.
echo [3/5] Iniciando Auth Service...
start "Auth Service" cmd /k "cd services\auth-service && npm run start:dev"
timeout /t 3 /nobreak >nul

echo.
echo [4/5] Iniciando User Service...
start "User Service" cmd /k "cd services\user-service && npm run start:dev"
timeout /t 3 /nobreak >nul

echo.
echo [5/5] Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   TODOS OS SERVICOS INICIADOS!
echo ========================================
echo.
echo Acesse:
echo - Frontend: http://localhost:5173
echo - API Gateway: http://localhost:3000
echo - Auth Service: http://localhost:3001
echo - User Service: http://localhost:3002
echo - phpMyAdmin: http://localhost/phpmyadmin
echo.
echo Para parar os servicos, feche as janelas do terminal
echo ou pressione Ctrl+C em cada uma delas.
echo.
pause
goto scripts_automatizados

:frontend_xampp
echo.
echo ========================================
echo   FRONTEND COM XAMPP - DESENVOLVIMENTO
echo ========================================
echo.
echo [1/3] Verificando XAMPP...
if not exist "C:\xampp\xampp-control.exe" (
    echo ERRO: XAMPP nao encontrado em C:\xampp\
    echo Execute a opcao [5] para configurar o XAMPP primeiro
    pause
    goto scripts_automatizados
)

echo [2/3] Iniciando XAMPP Apache...
start "" "C:\xampp\xampp-control.exe"
echo Aguarde 5 segundos para o XAMPP carregar...
timeout /t 5 /nobreak >nul

echo [3/3] Iniciando frontend de desenvolvimento...
cd frontend
echo.
echo O frontend sera aberto em: http://localhost:5173
echo XAMPP Apache em: http://localhost
echo.
echo Para parar, pressione Ctrl+C
echo.
npm run dev
pause
goto scripts_automatizados

:frontend_docker
echo.
echo ========================================
echo   FRONTEND COM DOCKER
echo ========================================
echo.
echo [1/3] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker nao encontrado!
    echo Execute a opcao [10] para configurar o Docker primeiro
    pause
    goto scripts_automatizados
)

echo [2/3] Verificando se Docker Desktop esta rodando...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker Desktop nao esta rodando!
    echo Por favor, inicie o Docker Desktop primeiro
    pause
    goto scripts_automatizados
)

echo [3/3] Iniciando frontend com Docker...
echo.
echo Construindo e iniciando conteneineres...
echo Este processo pode demorar alguns minutos na primeira vez...
echo.

docker-compose -f docker-compose.frontend.yml up --build

echo.
echo ========================================
echo   FRONTEND DOCKER INICIADO!
echo ========================================
echo.
echo ACESSOS:
echo - Frontend (Vite): http://localhost:5173
echo - Frontend (Nginx): http://localhost:80
echo.
echo Para parar, pressione Ctrl+C
echo Para parar completamente: docker-compose -f docker-compose.frontend.yml down
echo.
pause
goto scripts_automatizados

:setup_docker
echo.
echo ========================================
echo   CONFIGURACAO DOCKER PARA FRONTEND
echo ========================================
echo.
echo [1/4] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker nao encontrado!
    echo Por favor, instale o Docker Desktop primeiro
    pause
    goto scripts_automatizados
)
echo ✅ Docker encontrado!

echo.
echo [2/4] Verificando se Docker Desktop esta rodando...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker Desktop nao esta rodando!
    echo Por favor, inicie o Docker Desktop primeiro
    pause
    goto scripts_automatizados
)
echo ✅ Docker Desktop esta rodando!

echo.
echo [3/4] Criando pasta nginx...
if not exist "nginx" mkdir nginx
echo ✅ Pasta nginx criada!

echo.
echo [4/4] Instalando dependencias do frontend...
cd frontend
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias
        pause
        cd ..
        goto scripts_automatizados
    )
) else (
    echo ✅ Dependencias ja instaladas!
)

echo.
echo ========================================
echo   CONFIGURACAO DOCKER CONCLUIDA!
echo ========================================
echo.
echo PRÓXIMOS PASSOS:
echo.
echo 1. Execute a opcao [9] Frontend com Docker
echo 2. Ou use: docker-compose -f docker-compose.frontend.yml up
echo.
echo ACESSOS:
echo - Frontend: http://localhost:5173
echo - Nginx: http://localhost:80
echo.
pause
goto scripts_automatizados

:frontend_simples_sub
echo.
echo ========================================
echo   INICIANDO FRONTEND - METODO SIMPLES
echo ========================================
echo.
echo Navegando para o diretorio do frontend...
cd /d "%~dp0frontend"
echo.
echo Iniciando o frontend...
echo O frontend sera aberto em: http://localhost:5173
echo.
npm run dev
pause
goto scripts_automatizados

:sistema_protecao
echo.
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
echo [5] Voltar ao Menu Principal
echo.

:protecao_menu
set /p protecao_choice="Escolha uma opcao (1-5): "

if "%protecao_choice%"=="1" goto :test
if "%protecao_choice%"=="2" goto :restore
if "%protecao_choice%"=="3" goto :backup
if "%protecao_choice%"=="4" goto :check
if "%protecao_choice%"=="5" goto menu

echo Opcao invalida! Tente novamente.
goto :protecao_menu

:test
echo.
echo Iniciando teste do sistema...
start cmd /k "cd frontend && npm run dev"
echo Sistema iniciado para teste!
goto :protecao_menu

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
    goto :protecao_menu
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
goto :protecao_menu

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
goto :protecao_menu

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
goto :protecao_menu

:exit
echo.
echo ========================================
echo   OBRIGADO POR USAR O SISTEMA!
echo ========================================
echo.
exit /b 0

