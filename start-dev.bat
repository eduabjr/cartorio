@echo off
echo ========================================
echo   SISTEMA DE CARTORIO - DESENVOLVIMENTO
echo ========================================
echo.

echo [1/3] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker nao encontrado! Instale o Docker Desktop.
    pause
    exit /b 1
)

echo [2/3] Iniciando servicos com Docker...
docker-compose up -d

echo.
echo [3/3] Aguardando servicos iniciarem...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Acesse:
echo   Frontend: http://localhost:3007
echo   API Gateway: http://localhost:3000
echo   RabbitMQ: http://localhost:15672
echo.
echo Para parar os servicos: docker-compose down
echo.
pause

