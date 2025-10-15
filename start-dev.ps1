# Script para iniciar desenvolvimento local
# Execute como Administrador se necessário

Write-Host "🚀 Iniciando Sistema de Cartório - Desenvolvimento Local" -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "frontend") -or -not (Test-Path "services")) {
    Write-Host "❌ Execute este script na raiz do projeto (F:\cartorio)" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js 18+" -ForegroundColor Red
    exit 1
}

# Verificar PostgreSQL
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL não encontrado. Certifique-se que está instalado e rodando" -ForegroundColor Yellow
}

Write-Host "`n📦 Instalando dependências..." -ForegroundColor Blue

# Frontend
Write-Host "Instalando dependências do Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Auth Service
Write-Host "Instalando dependências do Auth Service..." -ForegroundColor Yellow
Set-Location services/auth-service
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do auth-service" -ForegroundColor Red
    exit 1
}
Set-Location ../..

# User Service
Write-Host "Instalando dependências do User Service..." -ForegroundColor Yellow
Set-Location services/user-service
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do user-service" -ForegroundColor Red
    exit 1
}
Set-Location ../..

# API Gateway
Write-Host "Instalando dependências do API Gateway..." -ForegroundColor Yellow
Set-Location services/api-gateway
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do api-gateway" -ForegroundColor Red
    exit 1
}
Set-Location ../..

Write-Host "`n✅ Todas as dependências instaladas!" -ForegroundColor Green

Write-Host "`n🔧 Configurando banco de dados..." -ForegroundColor Blue

# Configurar banco Auth Service
Write-Host "Configurando banco para Auth Service..." -ForegroundColor Yellow
Set-Location services/auth-service
npx prisma generate
npx prisma db push
Set-Location ../..

# Configurar banco User Service
Write-Host "Configurando banco para User Service..." -ForegroundColor Yellow
Set-Location services/user-service
npx prisma generate
npx prisma db push
Set-Location ../..

Write-Host "`n✅ Banco de dados configurado!" -ForegroundColor Green

Write-Host "`n🚀 Para iniciar os serviços, abra 4 terminais e execute:" -ForegroundColor Blue
Write-Host "`nTerminal 1 (Auth Service):" -ForegroundColor Cyan
Write-Host "cd services/auth-service && npm run start:dev" -ForegroundColor White

Write-Host "`nTerminal 2 (User Service):" -ForegroundColor Cyan
Write-Host "cd services/user-service && npm run start:dev" -ForegroundColor White

Write-Host "`nTerminal 3 (API Gateway):" -ForegroundColor Cyan
Write-Host "cd services/api-gateway && npm run start:dev" -ForegroundColor White

Write-Host "`nTerminal 4 (Frontend):" -ForegroundColor Cyan
Write-Host "cd frontend && npm run dev" -ForegroundColor White

Write-Host "`n🌐 Acessos:" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "API Gateway: http://localhost:3000" -ForegroundColor White
Write-Host "Auth Service: http://localhost:3001" -ForegroundColor White
Write-Host "User Service: http://localhost:3002" -ForegroundColor White

Write-Host "`n📖 Para mais informações, consulte: dev-setup.md" -ForegroundColor Green
