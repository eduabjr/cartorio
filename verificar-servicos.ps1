# Script PowerShell para Verificar Saúde dos Microserviços

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICAÇÃO DE SAÚDE DOS SERVIÇOS    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{ Name = "API Gateway"; Port = 3000; Path = "/health"; Container = "cartorio-api-gateway" },
    @{ Name = "Auth Service"; Port = 3001; Path = "/health"; Container = "cartorio-auth-service" },
    @{ Name = "User Service"; Port = 3002; Path = "/health"; Container = "cartorio-user-service" },
    @{ Name = "Protocolo Service"; Port = 3003; Path = "/health"; Container = "cartorio-protocolo-service" },
    @{ Name = "Cliente Service"; Port = 3004; Path = "/health"; Container = "cartorio-cliente-service" },
    @{ Name = "MySQL"; Port = 3306; Container = "cartorio-mysql" },
    @{ Name = "Redis"; Port = 6379; Container = "cartorio-redis" }
)

Write-Host "🏥 Verificando Saúde dos Serviços..." -ForegroundColor Yellow
Write-Host ""

$healthyCount = 0
$totalCount = 0

foreach ($service in $services) {
    $totalCount++
    
    # Verificar se container está rodando
    $containerStatus = docker ps --filter "name=$($service.Container)" --format "{{.Status}}" 2>$null
    
    if ($containerStatus) {
        Write-Host "📦 $($service.Name)" -ForegroundColor Cyan -NoNewline
        Write-Host " - Container: " -NoNewline
        
        if ($containerStatus -match "healthy") {
            Write-Host "✅ HEALTHY" -ForegroundColor Green -NoNewline
        } elseif ($containerStatus -match "Up") {
            Write-Host "🟡 UP" -ForegroundColor Yellow -NoNewline
        } else {
            Write-Host "❌ DOWN" -ForegroundColor Red -NoNewline
        }
        
        # Verificar endpoint HTTP (se aplicável)
        if ($service.Path) {
            Write-Host " - HTTP: " -NoNewline
            $url = "http://localhost:$($service.Port)$($service.Path)"
            
            try {
                $null = Invoke-RestMethod -Uri $url -TimeoutSec 3 -ErrorAction Stop
                Write-Host "✅ OK" -ForegroundColor Green
                $healthyCount++
            } catch {
                Write-Host "❌ FAIL" -ForegroundColor Red
            }
        } else {
            Write-Host ""
            $healthyCount++
        }
    } else {
        Write-Host "📦 $($service.Name)" -ForegroundColor Cyan -NoNewline
        Write-Host " - ❌ CONTAINER NÃO ENCONTRADO" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

$percentage = [math]::Round(($healthyCount / $totalCount) * 100)

if ($healthyCount -eq $totalCount) {
    Write-Host "✅ SISTEMA 100% OPERACIONAL ($healthyCount/$totalCount)" -ForegroundColor Green
} elseif ($healthyCount -gt ($totalCount * 0.7)) {
    Write-Host "⚠️  SISTEMA PARCIALMENTE OPERACIONAL ($healthyCount/$totalCount - $percentage%)" -ForegroundColor Yellow
} else {
    Write-Host "❌ SISTEMA COM PROBLEMAS CRÍTICOS ($healthyCount/$totalCount - $percentage%)" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar estado do Circuit Breaker
Write-Host "🔌 Estado do Circuit Breaker:" -ForegroundColor Cyan
Write-Host ""

try {
    $healthData = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5
    
    if ($healthData.services) {
        foreach ($svc in $healthData.services.PSObject.Properties) {
            $state = $svc.Value
            $icon = if ($state -eq "CLOSED") { "🟢" } elseif ($state -eq "OPEN") { "🔴" } else { "🟡" }
            Write-Host "   $icon $($svc.Name): $state"
        }
    }
} catch {
    Write-Host "   ❌ Não foi possível obter dados do Circuit Breaker" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Recursos dos Containers:" -ForegroundColor Cyan
Write-Host ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | Select-Object -First 10

Write-Host ""
Write-Host "💡 Dicas:" -ForegroundColor Yellow
Write-Host "   - Se algum serviço está DOWN, execute: docker-compose restart <nome-servico>" -ForegroundColor Gray
Write-Host "   - Para ver logs: docker-compose logs -f <nome-servico>" -ForegroundColor Gray
Write-Host "   - Para reiniciar tudo: docker-compose restart" -ForegroundColor Gray
Write-Host ""

