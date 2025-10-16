@echo off
REM ========================================
REM   SCRIPTS AUTOMATIZADOS - SISTEMA DE CARTORIO
REM ========================================
REM
REM Este arquivo consolida todos os scripts .bat do projeto
REM Escolha a opcao desejada para executar
REM

:menu
echo.
echo ========================================
echo   SISTEMA DE CARTORIO - SCRIPTS
echo ========================================
echo.
echo Escolha uma opcao:
echo.
echo [1] Frontend Web (Desenvolvimento)
echo [2] Frontend Desktop (Electron)
echo [3] Gerar Executavel
echo [4] Frontend Estavel
echo [5] Configurar XAMPP
echo [6] Desenvolvimento Local
echo [7] Iniciar Todos os Serviços (XAMPP)
echo [8] Frontend com XAMPP
echo [9] Frontend com Docker
echo [10] Configurar Docker
echo [11] Frontend Simples
echo [0] Sair
echo.
set /p choice="Digite sua opcao (0-11): "

if "%choice%"=="1" goto frontend_web
if "%choice%"=="2" goto frontend_desktop
if "%choice%"=="3" goto gerar_executavel
if "%choice%"=="4" goto frontend_estavel
if "%choice%"=="5" goto setup_xampp
if "%choice%"=="6" goto dev_local
if "%choice%"=="7" goto start_all_services
if "%choice%"=="8" goto frontend_xampp
if "%choice%"=="9" goto frontend_docker
if "%choice%"=="10" goto setup_docker
if "%choice%"=="11" goto frontend_simples
if "%choice%"=="0" goto exit
goto menu

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
goto menu

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
goto menu

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
goto menu

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
    goto menu
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
goto menu

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
    goto menu
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
    goto menu
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
        goto menu
    )
    cd ..\..
)
echo ✅ Dependencias instaladas!

echo.
echo [4/5] Criando script de inicializacao...
echo @echo off > start-xampp.bat
echo echo ======================================== >> start-xampp.bat
echo echo    INICIANDO PROJETO COM XAMPP >> start-xampp.bat
echo echo ======================================== >> start-xampp.bat
echo echo. >> start-xampp.bat
echo echo [1/4] Iniciando XAMPP... >> start-xampp.bat
echo start "" "C:\xampp\xampp-control.exe" >> start-xampp.bat
echo echo Aguarde 10 segundos para o XAMPP inicializar... >> start-xampp.bat
echo timeout /t 10 /nobreak ^>nul >> start-xampp.bat
echo echo. >> start-xampp.bat
echo echo [2/4] Iniciando Auth Service... >> start-xampp.bat
echo start "Auth Service" cmd /k "cd services\auth-service && npm run start:dev" >> start-xampp.bat
echo timeout /t 3 /nobreak ^>nul >> start-xampp.bat
echo echo. >> start-xampp.bat
echo echo [3/4] Iniciando User Service... >> start-xampp.bat
echo start "User Service" cmd /k "cd services\user-service && npm run start:dev" >> start-xampp.bat
echo timeout /t 3 /nobreak ^>nul >> start-xampp.bat
echo echo. >> start-xampp.bat
echo echo [4/4] Iniciando Frontend... >> start-xampp.bat
echo start "Frontend" cmd /k "cd frontend && npm run dev" >> start-xampp.bat
echo echo. >> start-xampp.bat
echo echo ✅ Todos os servicos iniciados! >> start-xampp.bat
echo echo. >> start-xampp.bat
echo echo Acesse: >> start-xampp.bat
echo echo - Frontend: http://localhost:5173 >> start-xampp.bat
echo echo - phpMyAdmin: http://localhost/phpmyadmin >> start-xampp.bat
echo echo. >> start-xampp.bat
echo pause >> start-xampp.bat
echo ✅ Script de inicializacao criado!

echo.
echo [5/5] Configuracao concluida!
echo.
echo ========================================
echo    PROXIMOS PASSOS:
echo ========================================
echo.
echo 1. Abra o XAMPP Control Panel
echo 2. Inicie o Apache e MySQL
echo 3. Acesse http://localhost/phpmyadmin
echo 4. Crie os bancos de dados:
echo    - auth_db
echo    - user_db
echo    - cartorio_db
echo 5. Execute: start-xampp.bat
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
goto menu

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
    goto menu
)

echo [2/2] Iniciando frontend...
cd frontend
npm install
npm run dev

echo.
echo Frontend iniciado em: http://localhost:5173
pause
goto menu

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
    goto menu
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
goto menu

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
    goto menu
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
goto menu

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
    goto menu
)

echo [2/3] Verificando se Docker Desktop esta rodando...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker Desktop nao esta rodando!
    echo Por favor, inicie o Docker Desktop primeiro
    pause
    goto menu
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
goto menu

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
    goto menu
)
echo ✅ Docker encontrado!

echo.
echo [2/4] Verificando se Docker Desktop esta rodando...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker Desktop nao esta rodando!
    echo Por favor, inicie o Docker Desktop primeiro
    pause
    goto menu
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
        goto menu
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
goto menu

:frontend_simples
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
goto menu

:exit
echo.
echo ========================================
echo   OBRIGADO POR USAR O SISTEMA!
echo ========================================
echo.
exit /b 0
