# SCRIPTS-POWERSHELL.ps1
# Script consolidado para operações PowerShell
# Uso: powershell -ExecutionPolicy Bypass -File SCRIPTS-POWERSHELL.ps1 [comando]

param(
    [string]$Command = "",
    [string]$message = "Update automático - $(Get-Date -Format 'dd/MM/yyyy HH:mm')",
    [switch]$force = $false
)

function Write-Color {
    param (
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Push-Quick {
    param(
        [string]$message,
        [switch]$force
    )
    
    $REPO_URL = "https://github.com/eduabjr/cartorio"
    $BRANCH = "main"

    Write-Color "========================================" "Green"
    Write-Color "   PUSH AUTOMÁTICO PARA GITHUB" "Green"
    Write-Color "   Repositório: $REPO_URL" "Cyan"
    Write-Color "========================================" "Green"
    Write-Color ""

    # Verificar se o Git está instalado
    try {
        git --version | Out-Null
    } catch {
        Write-Color "❌ ERRO: Git não encontrado. Por favor, instale o Git e configure-o." "Red"
        exit 1
    }

    # Verificar se estamos em um repositório Git
    if (-not (Test-Path ".git")) {
        Write-Color "❌ ERRO: Este diretório não é um repositório Git!" "Red"
        Write-Color "Inicializando repositório Git..." "Yellow"
        
        git init
        if ($LASTEXITCODE -ne 0) {
            Write-Color "❌ ERRO: Falha ao inicializar repositório Git!" "Red"
            exit 1
        }
        
        Write-Color "✅ Repositório Git inicializado!" "Green"
    }

    # Configurar remote origin se não existir
    $currentRemoteUrl = git config --get remote.origin.url 2>$null
    if ($LASTEXITCODE -ne 0 -or $currentRemoteUrl -ne $REPO_URL) {
        if ($currentRemoteUrl) {
            Write-Color "🔗 Removendo remote 'origin' existente com URL incorreta: $currentRemoteUrl" "Yellow"
            git remote remove origin
        }
        Write-Color "🔗 Adicionando remote 'origin' com a URL correta: $REPO_URL" "Yellow"
        git remote add origin $REPO_URL
        if ($LASTEXITCODE -ne 0) {
            Write-Color "❌ ERRO: Falha ao configurar remote origin!" "Red"
            exit 1
        }
        Write-Color "✅ Remote origin configurado!" "Green"
    } else {
        Write-Color "🔗 Remote origin já configurado e correto: $currentRemoteUrl" "Cyan"
    }

    # Adicionar todos os arquivos
    Write-Color "📁 Adicionando arquivos ao staging..." "Yellow"
    git add .
    if ($LASTEXITCODE -ne 0) {
        Write-Color "❌ ERRO: Falha ao adicionar arquivos!" "Red"
        exit 1
    }

    # Verificar se há mudanças para commitar
    $changes = git diff --cached --name-only
    if (-not $changes) {
        Write-Color "ℹ️  Nenhuma mudança detectada para commitar." "Yellow"
        Write-Color "Tentando fazer pull para sincronizar..." "Yellow"
        
        git pull origin $BRANCH
        if ($LASTEXITCODE -ne 0) {
            Write-Color "⚠️  Aviso: Falha no pull. Pode haver conflitos ou o branch remoto não existe. Continuando com push..." "Yellow"
        }
    } else {
        Write-Color "📝 Fazendo commit das mudanças..." "Yellow"
        Write-Color "Mensagem: $message" "Cyan"
        
        git commit -m $message
        if ($LASTEXITCODE -ne 0) {
            Write-Color "❌ ERRO: Falha ao fazer commit!" "Red"
            exit 1
        }
        Write-Color "✅ Commit realizado com sucesso!" "Green"
    }

    # Fazer push para o repositório
    Write-Color "🚀 Enviando para GitHub..." "Yellow"
    if ($force) {
        git push origin $BRANCH --force
        Write-Color "⚠️  Push forçado executado!" "Yellow"
    } else {
        git push origin $BRANCH
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Color ""
        Write-Color "🎉 SUCESSO! Código enviado para GitHub!" "Green"
        Write-Color "🌐 Repositório: $REPO_URL" "Cyan"
        Write-Color "🌿 Branch: $BRANCH" "Cyan"
        Write-Color ""
        Write-Color "✅ Push automático concluído com sucesso!" "Green"
    } else {
        Write-Color ""
        Write-Color "❌ ERRO: Falha no push para GitHub!" "Red"
        Write-Color ""
        Write-Color "Possíveis soluções:" "Yellow"
        Write-Color "1. Verifique sua conexão com a internet" "White"
        Write-Color "2. Confirme suas credenciais do GitHub" "White"
        Write-Color "3. Execute 'npm run push:quick -- --force' para forçar o push" "White"
        Write-Color "4. Verifique se o repositório existe e você tem permissão" "White"
        Write-Color "5. Se o branch remoto '$BRANCH' não existir, crie-o manualmente" "White"
        Write-Color ""
        exit 1
    }

    Write-Color ""
    Write-Color "========================================" "Green"
    Write-Color "   PUSH CONCLUÍDO!" "Green"
    Write-Color "========================================" "Green"
}

function Start-Dev {
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

    # Verificar XAMPP
    if (Test-Path "C:\xampp\xampp-control.exe") {
        Write-Host "✅ XAMPP encontrado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  XAMPP não encontrado. Certifique-se que está instalado" -ForegroundColor Yellow
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

    Write-Host "`n📖 Para mais informações, consulte: GUIA-COMPLETO.md" -ForegroundColor Green
}

# Lógica principal para chamar a função correta
switch ($Command) {
    "push" { Push-Quick -message $message -force:$force }
    "start-dev" { Start-Dev }
    default {
        Write-Color "Comando desconhecido: $Command" "Red"
        Write-Color "Uso: SCRIPTS-POWERSHELL.ps1 [push|start-dev]" "Yellow"
    }
}