# Utilitários para gerenciar Docker Compose - PowerShell
# Uso: .\scripts\docker-compose-utils.ps1 [comando]

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    [Parameter(Position=1)]
    [string]$Service = ""
)

# Cores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Função para exibir ajuda
function Show-Help {
    Write-Host "🐳 Docker Compose Utils - Sistema Cartório" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Comandos disponíveis:"
    Write-Host ""
    Write-Host "  dev          - Iniciar ambiente de desenvolvimento" -ForegroundColor $Green
    Write-Host "  prod         - Iniciar ambiente de produção" -ForegroundColor $Green
    Write-Host "  test         - Executar testes em containers" -ForegroundColor $Green
    Write-Host "  stop         - Parar todos os serviços" -ForegroundColor $Green
    Write-Host "  restart      - Reiniciar todos os serviços" -ForegroundColor $Green
    Write-Host "  logs         - Ver logs de todos os serviços" -ForegroundColor $Green
    Write-Host "  status       - Ver status dos serviços" -ForegroundColor $Green
    Write-Host "  clean        - Limpar containers e volumes" -ForegroundColor $Green
    Write-Host "  backup       - Fazer backup do banco de dados" -ForegroundColor $Green
    Write-Host "  restore      - Restaurar backup do banco de dados" -ForegroundColor $Green
    Write-Host "  health       - Verificar saúde dos serviços" -ForegroundColor $Green
    Write-Host "  scale        - Escalar serviços" -ForegroundColor $Green
    Write-Host "  update       - Atualizar imagens e reiniciar" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Exemplos:"
    Write-Host "  .\scripts\docker-compose-utils.ps1 dev"
    Write-Host "  .\scripts\docker-compose-utils.ps1 logs api-gateway"
    Write-Host "  .\scripts\docker-compose-utils.ps1 scale api-gateway=3"
}

# Função para verificar se Docker está rodando
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker primeiro." -ForegroundColor $Red
        exit 1
    }
}

# Função para aguardar serviços estarem prontos
function Wait-ForServices {
    Write-Host "⏳ Aguardando serviços estarem prontos..." -ForegroundColor $Yellow
    Start-Sleep -Seconds 10
    
    $services = @("api-gateway:3000", "auth-service:3001", "user-service:3002")
    
    foreach ($service in $services) {
        $name = $service.Split(':')[0]
        $port = $service.Split(':')[1]
        
        Write-Host "🔍 Verificando $name..." -ForegroundColor $Blue
        
        $maxAttempts = 30
        $attempt = 1
        
        while ($attempt -le $maxAttempts) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -TimeoutSec 5 -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    Write-Host "✅ $name está pronto!" -ForegroundColor $Green
                    break
                }
            }
            catch {
                # Serviço ainda não está pronto
            }
            
            if ($attempt -eq $maxAttempts) {
                Write-Host "❌ $name não ficou pronto após $maxAttempts tentativas" -ForegroundColor $Red
                return $false
            }
            
            Write-Host "⏳ Tentativa $attempt/$maxAttempts - $name ainda não está pronto..." -ForegroundColor $Yellow
            Start-Sleep -Seconds 2
            $attempt++
        }
    }
    
    Write-Host "🎉 Todos os serviços estão prontos!" -ForegroundColor $Green
    return $true
}

# Comandos principais
switch ($Command.ToLower()) {
    "dev" {
        Write-Host "🚀 Iniciando ambiente de desenvolvimento..." -ForegroundColor $Blue
        Test-Docker
        docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
        Wait-ForServices
        Write-Host "✅ Ambiente de desenvolvimento iniciado!" -ForegroundColor $Green
        Write-Host "📋 URLs disponíveis:" -ForegroundColor $Blue
        Write-Host "  - API Gateway: http://localhost:3000"
        Write-Host "  - Auth Service: http://localhost:3001"
        Write-Host "  - User Service: http://localhost:3002"
        Write-Host "  - Adminer: http://localhost:8080"
        Write-Host "  - Redis Commander: http://localhost:8081"
        Write-Host "  - MailHog: http://localhost:8025"
    }
    
    "prod" {
        Write-Host "🚀 Iniciando ambiente de produção..." -ForegroundColor $Blue
        Test-Docker
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        Wait-ForServices
        Write-Host "✅ Ambiente de produção iniciado!" -ForegroundColor $Green
        Write-Host "📋 URLs disponíveis:" -ForegroundColor $Blue
        Write-Host "  - API Gateway: https://localhost"
        Write-Host "  - Grafana: http://localhost:3001"
        Write-Host "  - Prometheus: http://localhost:9090"
        Write-Host "  - Alertmanager: http://localhost:9093"
    }
    
    "test" {
        Write-Host "🧪 Executando testes..." -ForegroundColor $Blue
        Test-Docker
        docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
        Write-Host "✅ Testes concluídos!" -ForegroundColor $Green
    }
    
    "stop" {
        Write-Host "⏹️  Parando todos os serviços..." -ForegroundColor $Yellow
        docker-compose down
        Write-Host "✅ Serviços parados!" -ForegroundColor $Green
    }
    
    "restart" {
        Write-Host "🔄 Reiniciando serviços..." -ForegroundColor $Yellow
        docker-compose restart
        Wait-ForServices
        Write-Host "✅ Serviços reiniciados!" -ForegroundColor $Green
    }
    
    "logs" {
        if ($Service) {
            Write-Host "📋 Logs do serviço $Service:" -ForegroundColor $Blue
            docker-compose logs -f $Service
        } else {
            Write-Host "📋 Logs de todos os serviços:" -ForegroundColor $Blue
            docker-compose logs -f
        }
    }
    
    "status" {
        Write-Host "📊 Status dos serviços:" -ForegroundColor $Blue
        docker-compose ps
        Write-Host ""
        Write-Host "📊 Uso de recursos:" -ForegroundColor $Blue
        docker stats --no-stream
    }
    
    "clean" {
        Write-Host "🧹 Limpando containers e volumes..." -ForegroundColor $Yellow
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Host "✅ Limpeza concluída!" -ForegroundColor $Green
    }
    
    "backup" {
        Write-Host "💾 Fazendo backup do banco de dados..." -ForegroundColor $Blue
        $backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
        docker-compose exec mysql mysqldump -u root -p${env:MYSQL_ROOT_PASSWORD} ${env:MYSQL_DATABASE} > $backupFile
        Write-Host "✅ Backup salvo em: $backupFile" -ForegroundColor $Green
    }
    
    "restore" {
        if (-not $Service) {
            Write-Host "❌ Por favor, especifique o arquivo de backup:" -ForegroundColor $Red
            Write-Host "Uso: .\scripts\docker-compose-utils.ps1 restore backup_file.sql"
            exit 1
        }
        
        Write-Host "📥 Restaurando backup: $Service" -ForegroundColor $Blue
        Get-Content $Service | docker-compose exec -T mysql mysql -u root -p${env:MYSQL_ROOT_PASSWORD} ${env:MYSQL_DATABASE}
        Write-Host "✅ Backup restaurado!" -ForegroundColor $Green
    }
    
    "health" {
        Write-Host "🏥 Verificando saúde dos serviços..." -ForegroundColor $Blue
        
        $services = @("api-gateway:3000", "auth-service:3001", "user-service:3002")
        
        foreach ($service in $services) {
            $name = $service.Split(':')[0]
            $port = $service.Split(':')[1]
            
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -TimeoutSec 5 -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    Write-Host "✅ $name`: Saudável" -ForegroundColor $Green
                } else {
                    Write-Host "❌ $name`: Não saudável" -ForegroundColor $Red
                }
            }
            catch {
                Write-Host "❌ $name`: Não saudável" -ForegroundColor $Red
            }
        }
    }
    
    "scale" {
        if (-not $Service) {
            Write-Host "❌ Por favor, especifique o serviço e número de réplicas:" -ForegroundColor $Red
            Write-Host "Uso: .\scripts\docker-compose-utils.ps1 scale service=replicas"
            Write-Host "Exemplo: .\scripts\docker-compose-utils.ps1 scale api-gateway=3"
            exit 1
        }
        
        Write-Host "📈 Escalando serviço: $Service" -ForegroundColor $Blue
        docker-compose up -d --scale $Service
        Write-Host "✅ Serviço escalado!" -ForegroundColor $Green
    }
    
    "update" {
        Write-Host "🔄 Atualizando imagens..." -ForegroundColor $Blue
        docker-compose pull
        docker-compose up -d
        Wait-ForServices
        Write-Host "✅ Atualização concluída!" -ForegroundColor $Green
    }
    
    "help" {
        Show-Help
    }
    
    default {
        Write-Host "❌ Comando não reconhecido: $Command" -ForegroundColor $Red
        Write-Host ""
        Show-Help
        exit 1
    }
}
