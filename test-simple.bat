@echo off
echo ========================================
echo   TESTE SIMPLIFICADO DO SISTEMA
echo ========================================
echo.

echo [1/4] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker nao encontrado! Instale o Docker Desktop.
    pause
    exit /b 1
)

echo [2/4] Parando containers existentes...
docker-compose -f docker-compose.simple.yml down

echo [3/4] Construindo e iniciando servicos...
docker-compose -f docker-compose.simple.yml up --build -d

echo.
echo [4/4] Aguardando servicos iniciarem...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo   SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Acesse:
echo   Frontend: http://localhost:3007
echo   API Gateway: http://localhost:3000
echo   Auth Service: http://localhost:3001
echo   User Service: http://localhost:3002
echo.
echo Para ver os logs: docker-compose -f docker-compose.simple.yml logs -f
echo Para parar: docker-compose -f docker-compose.simple.yml down
echo.
pause
