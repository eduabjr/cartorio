# Script para iniciar todos os serviços do sistema
Write-Host "🚀 Iniciando todos os serviços do sistema..." -ForegroundColor Green

# Função para verificar se uma porta está em uso
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Função para iniciar um serviço
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [int]$Port,
        [string]$StartCommand = "npm run start:dev"
    )
    
    Write-Host "📦 Verificando $ServiceName..." -ForegroundColor Yellow
    
    if (Test-Port -Port $Port) {
        Write-Host "✅ $ServiceName já está rodando na porta $Port" -ForegroundColor Green
        return
    }
    
    if (Test-Path $ServicePath) {
        Write-Host "🔄 Iniciando $ServiceName..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ServicePath'; $StartCommand"
        Start-Sleep -Seconds 2
    } else {
        Write-Host "❌ Caminho não encontrado: $ServicePath" -ForegroundColor Red
    }
}

# Iniciar serviços
Write-Host "`n🔧 Iniciando microserviços..." -ForegroundColor Magenta

# API Gateway (porta 3001)
Start-Service -ServiceName "API Gateway" -ServicePath "services\api-gateway" -Port 3001 -StartCommand "npm run start:dev"

# Auth Service (porta 3002)
Start-Service -ServiceName "Auth Service" -ServicePath "services\auth-service" -Port 3002 -StartCommand "npm run dev"

# User Service (porta 3003)
Start-Service -ServiceName "User Service" -ServicePath "services\user-service" -Port 3003 -StartCommand "npm run dev"

# Frontend (porta 3000)
Start-Service -ServiceName "Frontend" -ServicePath "frontend" -Port 3000 -StartCommand "npm run dev"

Write-Host "`n⏳ Aguardando serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verificar status dos serviços
Write-Host "`n📊 Status dos serviços:" -ForegroundColor Magenta

$services = @(
    @{Name="Frontend"; Port=3000; URL="http://localhost:3000"},
    @{Name="API Gateway"; Port=3001; URL="http://localhost:3001"},
    @{Name="Auth Service"; Port=3002; URL="http://localhost:3002"},
    @{Name="User Service"; Port=3003; URL="http://localhost:3003"}
)

foreach ($service in $services) {
    if (Test-Port -Port $service.Port) {
        Write-Host "✅ $($service.Name) - Porta $($service.Port) - $($service.URL)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($service.Name) - Porta $($service.Port) - OFFLINE" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Script de inicialização concluído!" -ForegroundColor Green
Write-Host "💡 Use 'Get-Process | Where-Object ProcessName -like node' para ver processos Node.js ativos" -ForegroundColor Cyan
