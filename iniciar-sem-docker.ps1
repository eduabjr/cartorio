# Script para Iniciar Sistema SEM Docker - Usando XAMPP
# Execute como: .\iniciar-sem-docker.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Sistema (SEM Docker)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configurações
$env:NODE_ENV = "development"
$env:DATABASE_URL = "mysql://root@localhost:3306/cartorio"
$env:REDIS_URL = "redis://localhost:6379"
$env:JWT_SECRET = "seu-jwt-secret-super-secreto"
$env:PORT_AUTH = "3001"
$env:PORT_USER = "3002"
$env:PORT_PROTOCOLO = "3003"
$env:PORT_CLIENTE = "3004"
$env:PORT_FUNCIONARIO = "3005"
$env:PORT_GATEWAY = "3000"

Write-Host "[1/7] Verificando MySQL..." -ForegroundColor Yellow

# Testar conexão MySQL
try {
    $mysqlTest = & "C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK - MySQL conectado" -ForegroundColor Green
    } else {
        Write-Host "  ERRO - MySQL não está rodando!" -ForegroundColor Red
        Write-Host "  Inicie o MySQL no XAMPP Control Panel" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "  ERRO - MySQL não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/7] Instalando dependências..." -ForegroundColor Yellow

$services = @(
    "services\shared",
    "services\auth-service",
    "services\user-service",
    "services\protocolo-service",
    "services\cliente-service",
    "services\funcionario-service",
    "services\api-gateway"
)

foreach ($service in $services) {
    if (Test-Path $service) {
        Write-Host "  -> $service" -ForegroundColor Gray
        Push-Location $service
        npm install --silent 2>&1 | Out-Null
        Pop-Location
    }
}

Write-Host "  OK - Dependências instaladas" -ForegroundColor Green
Write-Host ""

Write-Host "[3/7] Compilando services..." -ForegroundColor Yellow

$servicesToBuild = @(
    "services\auth-service",
    "services\user-service",
    "services\protocolo-service",
    "services\cliente-service",
    "services\funcionario-service",
    "services\api-gateway"
)

foreach ($service in $servicesToBuild) {
    if (Test-Path $service) {
        Write-Host "  -> $service" -ForegroundColor Gray
        Push-Location $service
        npm run build --silent 2>&1 | Out-Null
        Pop-Location
    }
}

Write-Host "  OK - Services compilados" -ForegroundColor Green
Write-Host ""

Write-Host "[4/7] Gerando Prisma Client..." -ForegroundColor Yellow

$servicesWithPrisma = @(
    "services\auth-service",
    "services\user-service",
    "services\protocolo-service",
    "services\cliente-service",
    "services\funcionario-service"
)

foreach ($service in $servicesWithPrisma) {
    if (Test-Path "$service\prisma") {
        Write-Host "  -> $service" -ForegroundColor Gray
        Push-Location $service
        npx prisma generate --silent 2>&1 | Out-Null
        Pop-Location
    }
}

Write-Host "  OK - Prisma Client gerado" -ForegroundColor Green
Write-Host ""

Write-Host "[5/7] Aplicando migrations..." -ForegroundColor Yellow

Push-Location "services\auth-service"
npx prisma db push --skip-generate 2>&1 | Out-Null
Pop-Location

Write-Host "  OK - Database atualizado" -ForegroundColor Green
Write-Host ""

Write-Host "[6/7] Iniciando services..." -ForegroundColor Yellow
Write-Host ""

# Criar pasta de logs
New-Item -ItemType Directory -Path "logs" -Force | Out-Null

# Iniciar cada service em background
Write-Host "  -> auth-service (porta 3001)" -ForegroundColor Gray
Push-Location "services\auth-service"
$env:PORT = "3001"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 2

Write-Host "  -> user-service (porta 3002)" -ForegroundColor Gray
Push-Location "services\user-service"
$env:PORT = "3002"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 2

Write-Host "  -> protocolo-service (porta 3003)" -ForegroundColor Gray
Push-Location "services\protocolo-service"
$env:PORT = "3003"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 2

Write-Host "  -> cliente-service (porta 3004)" -ForegroundColor Gray
Push-Location "services\cliente-service"
$env:PORT = "3004"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 2

Write-Host "  -> funcionario-service (porta 3005)" -ForegroundColor Gray
Push-Location "services\funcionario-service"
$env:PORT = "3005"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 2

Write-Host "  -> api-gateway (porta 3000)" -ForegroundColor Gray
Push-Location "services\api-gateway"
$env:PORT = "3000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Minimized
Pop-Location

Write-Host ""
Write-Host "  OK - Services iniciados" -ForegroundColor Green
Write-Host ""

Write-Host "[7/7] Aguardando inicialização..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SISTEMA INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "SERVICES RODANDO:" -ForegroundColor Cyan
Write-Host "  API Gateway:     http://localhost:3000" -ForegroundColor White
Write-Host "  Auth Service:    http://localhost:3001" -ForegroundColor White
Write-Host "  User Service:    http://localhost:3002" -ForegroundColor White
Write-Host "  Protocolo:       http://localhost:3003" -ForegroundColor White
Write-Host "  Cliente:         http://localhost:3004" -ForegroundColor White
Write-Host "  Funcionário:     http://localhost:3005" -ForegroundColor White
Write-Host ""

Write-Host "FRONTEND:" -ForegroundColor Cyan
Write-Host "  Execute: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "Para PARAR todos os services:" -ForegroundColor Yellow
Write-Host "  .\parar-services.ps1" -ForegroundColor Gray
Write-Host ""

