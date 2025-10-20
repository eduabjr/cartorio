@echo off
echo Iniciando todos os servicos do sistema...

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
