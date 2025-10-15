@echo off
echo ========================================
echo    CONFIGURACAO DO PROJETO COM XAMPP
echo ========================================
echo.

echo [1/5] Verificando se o XAMPP esta instalado...
if not exist "C:\xampp\xampp-control.exe" (
    echo ERRO: XAMPP nao encontrado em C:\xampp\
    echo Por favor, instale o XAMPP primeiro: https://www.apachefriends.org/download.html
    pause
    exit /b 1
)
echo ✅ XAMPP encontrado!

echo.
echo [2/5] Copiando arquivos .env de exemplo...
if not exist "env-examples" (
    echo ERRO: Pasta env-examples nao encontrada!
    pause
    exit /b 1
)

copy "env-examples\auth-service.env" "services\auth-service\.env" >nul 2>&1
copy "env-examples\user-service.env" "services\user-service\.env" >nul 2>&1
copy "env-examples\api-gateway.env" "services\api-gateway\.env" >nul 2>&1
copy "env-examples\frontend.env" "frontend\.env" >nul 2>&1
echo ✅ Arquivos .env copiados!

echo.
echo [3/5] Instalando dependencias...
echo Instalando dependencias do frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do frontend
    pause
    exit /b 1
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
        exit /b 1
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
echo Pressione qualquer tecla para continuar...
pause >nul
