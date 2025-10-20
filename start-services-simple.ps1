# Script simples para iniciar todos os serviços
Write-Host "Iniciando todos os serviços do sistema..." -ForegroundColor Green

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

# Verificar status atual
Write-Host "`nStatus atual dos serviços:" -ForegroundColor Yellow

$services = @(
    @{Name="Frontend"; Port=3000},
    @{Name="API Gateway"; Port=3001},
    @{Name="Auth Service"; Port=3002},
    @{Name="User Service"; Port=3003}
)

foreach ($service in $services) {
    if (Test-Port -Port $service.Port) {
        Write-Host "✅ $($service.Name) - Porta $($service.Port) - ONLINE" -ForegroundColor Green
    } else {
        Write-Host "❌ $($service.Name) - Porta $($service.Port) - OFFLINE" -ForegroundColor Red
    }
}

Write-Host "`nPara iniciar os serviços manualmente:" -ForegroundColor Cyan
Write-Host "1. Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "2. API Gateway: cd services\api-gateway && npm run start:dev" -ForegroundColor White
Write-Host "3. Auth Service: cd services\auth-service && npm run dev" -ForegroundColor White
Write-Host "4. User Service: cd services\user-service && npm run dev" -ForegroundColor White

Write-Host "`nScript concluído!" -ForegroundColor Green
