# ========================================================================
# TODOS OS SCRIPTS POWERSHELL CONSOLIDADOS - SISTEMA CARTÓRIO
# Este arquivo consolida TODOS os scripts .ps1 do projeto
# ========================================================================

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   TODOS OS SCRIPTS POWERSHELL CONSOLIDADOS - SISTEMA CARTORIO" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este arquivo consolida todos os scripts PowerShell:" -ForegroundColor Yellow
Write-Host "  1. iniciar-microservicos.ps1  - Inicia microserviços com Docker" -ForegroundColor White
Write-Host "  2. verificar-servicos.ps1     - Verifica saúde dos serviços" -ForegroundColor White
Write-Host "  3. start-services.ps1         - Inicia serviços individuais" -ForegroundColor White
Write-Host "  4. start-services-simple.ps1  - Versão simplificada" -ForegroundColor White
Write-Host "  5. push-git.ps1               - Push automático para Git" -ForegroundColor White
Write-Host "  6. SCRIPTS-POWERSHELL.ps1     - Scripts adicionais" -ForegroundColor White
Write-Host "  7. CONSOLIDATED-POWERSHELL.ps1 - Menu interativo" -ForegroundColor White
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# ========================================================================
# MENU PRINCIPAL
# ========================================================================

function Show-Menu {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   MENU PRINCIPAL" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1] Iniciar Microserviços (Docker)" -ForegroundColor Green
    Write-Host "  [2] Verificar Saúde dos Serviços" -ForegroundColor Green
    Write-Host "  [3] Iniciar Serviços Individuais" -ForegroundColor Green
    Write-Host "  [4] Status Simples dos Serviços" -ForegroundColor Green
    Write-Host "  [5] Push para GitHub" -ForegroundColor Yellow
    Write-Host "  [6] Parar Todos os Containers Docker" -ForegroundColor Red
    Write-Host "  [0] Sair" -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
}

do {
    Show-Menu
    $opcao = Read-Host "Escolha uma opção"
    
    switch ($opcao) {
        "1" {
            # INICIAR MICROSERVIÇOS COM DOCKER
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "  INICIANDO MICROSERVIÇOS COM DOCKER" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host ""
            
            # Verificar Docker
            try {
                $dockerVersion = docker --version
                Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
            } catch {
                Write-Host "❌ Docker não encontrado!" -ForegroundColor Red
                Write-Host "Instale o Docker Desktop primeiro." -ForegroundColor Yellow
                pause
                continue
            }
            
            # Parar containers antigos
            Write-Host ""
            Write-Host "🛑 Parando containers antigos..." -ForegroundColor Yellow
            docker-compose down 2>$null
            
            # Iniciar serviços
            Write-Host ""
            Write-Host "🏗️  Construindo e iniciando microserviços..." -ForegroundColor Yellow
            docker-compose up -d --build
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Microserviços iniciados com sucesso!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Acesse: http://localhost" -ForegroundColor Cyan
            } else {
                Write-Host ""
                Write-Host "❌ Erro ao iniciar serviços!" -ForegroundColor Red
            }
            
            pause
        }
        
        "2" {
            # VERIFICAR SAÚDE DOS SERVIÇOS
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "  VERIFICAÇÃO DE SAÚDE DOS SERVIÇOS" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host ""
            
            $services = @(
                @{ Name = "API Gateway"; Port = 3000; Path = "/health" },
                @{ Name = "Auth Service"; Port = 3001; Path = "/health" },
                @{ Name = "User Service"; Port = 3002; Path = "/health" },
                @{ Name = "Protocolo Service"; Port = 3003; Path = "/health" },
                @{ Name = "Cliente Service"; Port = 3004; Path = "/health" }
            )
            
            foreach ($service in $services) {
                $url = "http://localhost:$($service.Port)$($service.Path)"
                try {
                    $null = Invoke-RestMethod -Uri $url -TimeoutSec 3 -ErrorAction Stop
                    Write-Host "✅ $($service.Name) - HEALTHY" -ForegroundColor Green
                } catch {
                    Write-Host "❌ $($service.Name) - UNHEALTHY" -ForegroundColor Red
                }
            }
            
            Write-Host ""
            Write-Host "Verificação concluída!" -ForegroundColor Cyan
            pause
        }
        
        "3" {
            # INICIAR SERVIÇOS INDIVIDUAIS
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "  INICIANDO SERVIÇOS INDIVIDUAIS" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host ""
            
            # Função para testar porta
            function Test-Port {
                param([int]$Port)
                try {
                    $connection = New-Object System.Net.Sockets.TcpClient
                    $connection.Connect("localhost", $Port)
                    $connection.Close()
                    return $true
                } catch {
                    return $false
                }
            }
            
            # API Gateway
            if (-not (Test-Port -Port 3001)) {
                Write-Host "🔄 Iniciando API Gateway..." -ForegroundColor Yellow
                Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'services\api-gateway'; npm run start:dev"
                Start-Sleep -Seconds 2
            } else {
                Write-Host "✅ API Gateway já está rodando" -ForegroundColor Green
            }
            
            # Auth Service
            if (-not (Test-Port -Port 3002)) {
                Write-Host "🔄 Iniciando Auth Service..." -ForegroundColor Yellow
                Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'services\auth-service'; npm run dev"
                Start-Sleep -Seconds 2
            } else {
                Write-Host "✅ Auth Service já está rodando" -ForegroundColor Green
            }
            
            # User Service
            if (-not (Test-Port -Port 3003)) {
                Write-Host "🔄 Iniciando User Service..." -ForegroundColor Yellow
                Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'services\user-service'; npm run dev"
                Start-Sleep -Seconds 2
            } else {
                Write-Host "✅ User Service já está rodando" -ForegroundColor Green
            }
            
            # Frontend
            if (-not (Test-Port -Port 3000)) {
                Write-Host "🔄 Iniciando Frontend..." -ForegroundColor Yellow
                Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev"
            } else {
                Write-Host "✅ Frontend já está rodando" -ForegroundColor Green
            }
            
            Write-Host ""
            Write-Host "🎉 Serviços iniciados!" -ForegroundColor Green
            pause
        }
        
        "4" {
            # STATUS SIMPLES
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Yellow
            Write-Host "   STATUS DOS SERVIÇOS" -ForegroundColor Yellow
            Write-Host "========================================" -ForegroundColor Yellow
            Write-Host ""
            
            function Test-Port {
                param([int]$Port)
                try {
                    $connection = New-Object System.Net.Sockets.TcpClient
                    $connection.Connect("localhost", $Port)
                    $connection.Close()
                    return $true
                } catch {
                    return $false
                }
            }
            
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
            
            pause
        }
        
        "5" {
            # PUSH PARA GIT
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "   PUSH AUTOMÁTICO PARA GITHUB" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            
            Write-Host "Executando push automatico usando npm run push:quick..." -ForegroundColor Yellow
            Write-Host ""
            
            # Executa o comando npm run push:quick
            npm run push:quick
            
            Write-Host ""
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
            } else {
                Write-Host "❌ Erro no push!" -ForegroundColor Red
            }
            
            pause
        }
        
        "6" {
            # PARAR CONTAINERS
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Red
            Write-Host "   PARANDO CONTAINERS DOCKER" -ForegroundColor Red
            Write-Host "========================================" -ForegroundColor Red
            Write-Host ""
            
            docker-compose down
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Containers parados com sucesso!" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "❌ Erro ao parar containers!" -ForegroundColor Red
            }
            
            pause
        }
        
        "0" {
            Write-Host ""
            Write-Host "Saindo..." -ForegroundColor Gray
            Write-Host ""
        }
        
        default {
            Write-Host ""
            Write-Host "❌ Opção inválida!" -ForegroundColor Red
            pause
        }
    }
} while ($opcao -ne "0")

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   OBRIGADO POR USAR O SISTEMA!" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

