@echo off
echo ========================================
echo   SISTEMA DE CARTORIO - MODO REDE
echo ========================================
echo.

REM Verificar se o Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Docker não está rodando!
    echo Por favor, inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

echo [INFO] Docker está rodando. Iniciando serviços...
echo.

REM Parar containers existentes
echo [INFO] Parando containers existentes...
docker-compose down

REM Iniciar todos os serviços
echo [INFO] Iniciando todos os serviços...
docker-compose up -d

REM Aguardar os serviços iniciarem
echo [INFO] Aguardando serviços iniciarem...
timeout /t 10 /nobreak >nul

REM Verificar status dos containers
echo [INFO] Verificando status dos containers...
docker-compose ps

echo.
echo ========================================
echo   ACESSO VIA REDE LOCAL
echo ========================================
echo.
echo 🌐 Frontend (Interface Principal):
echo    http://192.168.15.192:3007
echo.
echo 🔧 API Gateway:
echo    http://192.168.15.192:3000
echo.
echo 🐰 RabbitMQ Management:
echo    http://192.168.15.192:15672
echo    Usuário: cartorio
echo    Senha: cartorio_password
echo.
echo 📊 PostgreSQL:
echo    Host: 192.168.15.192
echo    Porta: 5432
echo    Database: cartorio_db
echo    Usuário: cartorio_user
echo    Senha: cartorio_password
echo.
echo ========================================
echo   COMO ACESSAR DE OUTROS DISPOSITIVOS
echo ========================================
echo.
echo 1. Certifique-se de que todos os dispositivos estão na mesma rede Wi-Fi
echo 2. Use os endereços acima em qualquer navegador
echo 3. Para acessar de celular/tablet, use: http://192.168.15.192:3007
echo.
echo ========================================
echo   COMANDOS ÚTEIS
echo ========================================
echo.
echo Para parar todos os serviços:
echo    docker-compose down
echo.
echo Para ver logs em tempo real:
echo    docker-compose logs -f
echo.
echo Para reiniciar apenas o frontend:
echo    docker-compose restart frontend
echo.
pause
