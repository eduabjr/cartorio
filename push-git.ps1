# Script simples para push no Git
param(
    [string]$message = "Update automático - $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "   PUSH AUTOMÁTICO PARA GITHUB" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Configurações
$REPO_URL = "https://github.com/eduabjr/cartorio"
$BRANCH = "main"

# Verificar se o Git está instalado
try {
    git --version | Out-Null
    Write-Host "✅ Git encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Git não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar se estamos em um repositório Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Este diretório não é um repositório Git!" -ForegroundColor Red
    Write-Host "Inicializando repositório Git..." -ForegroundColor Yellow
    
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERRO: Falha ao inicializar repositório Git!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Repositório Git inicializado!" -ForegroundColor Green
}

# Configurar remote origin se não existir
$currentRemoteUrl = git config --get remote.origin.url 2>$null
if ($LASTEXITCODE -ne 0 -or $currentRemoteUrl -ne $REPO_URL) {
    if ($currentRemoteUrl) {
        Write-Host "🔗 Removendo remote 'origin' existente" -ForegroundColor Yellow
        git remote remove origin
    }
    Write-Host "🔗 Adicionando remote 'origin'" -ForegroundColor Yellow
    git remote add origin $REPO_URL
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERRO: Falha ao configurar remote origin!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Remote origin configurado!" -ForegroundColor Green
} else {
    Write-Host "✅ Remote origin já configurado" -ForegroundColor Green
}

# Adicionar todos os arquivos
Write-Host "📁 Adicionando arquivos..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO: Falha ao adicionar arquivos!" -ForegroundColor Red
    exit 1
}

# Verificar se há mudanças para commitar
$changes = git diff --cached --name-only
if (-not $changes) {
    Write-Host "ℹ️  Nenhuma mudança detectada para commitar." -ForegroundColor Yellow
} else {
    Write-Host "📝 Fazendo commit..." -ForegroundColor Yellow
    Write-Host "Mensagem: $message" -ForegroundColor Cyan
    
    git commit -m $message
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERRO: Falha ao fazer commit!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
}

# Fazer push para o repositório
Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Yellow
git push origin $BRANCH

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 SUCESSO! Código enviado para GitHub!" -ForegroundColor Green
    Write-Host "🌐 Repositório: $REPO_URL" -ForegroundColor Cyan
    Write-Host "🌿 Branch: $BRANCH" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Push automático concluído com sucesso!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ ERRO: Falha no push para GitHub!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "1. Verifique sua conexão com a internet" -ForegroundColor White
    Write-Host "2. Confirme suas credenciais do GitHub" -ForegroundColor White
    Write-Host "3. Verifique se o repositório existe e você tem permissão" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   PUSH CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
