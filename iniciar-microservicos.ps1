# Script PowerShell para Iniciar Microserviços
# Sistema de Cartório com Arquitetura de Microserviços

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SISTEMA CARTÓRIO - MICROSERVIÇOS    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está instalado
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado! Instale o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se Docker está rodando
Write-Host ""
Write-Host "🔍 Verificando se Docker está rodando..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando! Inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# Parar containers antigos
Write-Host ""
Write-Host "🛑 Parando containers antigos..." -ForegroundColor Yellow
docker-compose down 2>$null

# Construir e iniciar serviços
Write-Host ""
Write-Host "🏗️  Construindo e iniciando microserviços..." -ForegroundColor Yellow
Write-Host "    Isso pode levar alguns minutos na primeira vez..." -ForegroundColor Gray
Write-Host ""

docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao iniciar serviços!" -ForegroundColor Red
    exit 1
}

# Aguardar serviços ficarem prontos
Write-Host ""
Write-Host "⏳ Aguardando serviços iniciarem (30 segundos)..." -ForegroundColor Yellow

$totalSteps = 30
for ($i = 1; $i -le $totalSteps; $i++) {
    $percent = [math]::Round(($i / $totalSteps) * 100)
    Write-Progress -Activity "Iniciando Microserviços" -Status "$percent% Completo" -PercentComplete $percent
    Start-Sleep -Seconds 1
}

Write-Progress -Activity "Iniciando Microserviços" -Completed

# Verificar status dos containers
Write-Host ""
Write-Host "📊 Status dos Containers:" -ForegroundColor Cyan
Write-Host ""
docker-compose ps

# Verificar health dos serviços
Write-Host ""
Write-Host "🏥 Verificando saúde dos serviços..." -ForegroundColor Yellow
Write-Host ""

$services = @(
    @{ Name = "API Gateway"; Port = 3000; Path = "/health" },
    @{ Name = "Auth Service"; Port = 3001; Path = "/health" },
    @{ Name = "User Service"; Port = 3002; Path = "/health" },
    @{ Name = "Protocolo Service"; Port = 3003; Path = "/health" },
    @{ Name = "Cliente Service"; Port = 3004; Path = "/health" }
)

$allHealthy = $true

foreach ($service in $services) {
    $url = "http://localhost:$($service.Port)$($service.Path)"
    try {
        $null = Invoke-RestMethod -Uri $url -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $($service.Name) - HEALTHY" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) - UNHEALTHY" -ForegroundColor Red
        $allHealthy = $false
    }
}

# Resumo final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           RESUMO FINAL                 " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allHealthy) {
    Write-Host "✅ TODOS OS SERVIÇOS ESTÃO FUNCIONANDO!" -ForegroundColor Green
} else {
    Write-Host "⚠️  ALGUNS SERVIÇOS ESTÃO COM PROBLEMAS" -ForegroundColor Yellow
    Write-Host "    Execute 'docker-compose logs -f' para ver detalhes" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🌐 URLs de Acesso:" -ForegroundColor Cyan
Write-Host "   Frontend:         http://localhost" -ForegroundColor White
Write-Host "   API Gateway:      http://localhost:3000" -ForegroundColor White
Write-Host "   Prometheus:       http://localhost:9090" -ForegroundColor White
Write-Host "   Grafana:          http://localhost:3001 (admin/admin123)" -ForegroundColor White

Write-Host ""
Write-Host "📝 Credenciais de Login:" -ForegroundColor Cyan
Write-Host "   Admin:      admin@cartorio.com / admin123" -ForegroundColor White
Write-Host "   Funcionário: funcionario@cartorio.com / func123" -ForegroundColor White
Write-Host "   Teste:      teste@cartorio.com / teste123" -ForegroundColor White

Write-Host ""
Write-Host "💡 Comandos Úteis:" -ForegroundColor Cyan
Write-Host "   Ver logs:        docker-compose logs -f" -ForegroundColor Gray
Write-Host "   Parar tudo:      docker-compose down" -ForegroundColor Gray
Write-Host "   Reiniciar:       docker-compose restart" -ForegroundColor Gray
Write-Host "   Status:          docker-compose ps" -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sistema pronto para uso! 🚀          " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Abrir browser (opcional)
$openBrowser = Read-Host "Deseja abrir o sistema no navegador? (S/N)"
if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
    Start-Process "http://localhost"
}

