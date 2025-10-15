# Script para Push Automatico para GitHub
# Uso: npm run push:quick

param(
    [string]$message = "Update automatico - $(Get-Date -Format 'dd/MM/yyyy HH:mm')",
    [switch]$force = $false
)

# Configuracoes
$REPO_URL = "https://github.com/eduabjr/cartorio"
$BRANCH = "main"

Write-Host "========================================" -ForegroundColor Green
Write-Host "   PUSH AUTOMATICO PARA GITHUB" -ForegroundColor Yellow
Write-Host "   Repositorio: $REPO_URL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar se estamos em um repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "ERRO: Este diretorio nao e um repositorio Git!" -ForegroundColor Red
    Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
    
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao inicializar repositorio Git!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Repositorio Git inicializado!" -ForegroundColor Green
}

# Configurar remote origin se nao existir
$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Configurando remote origin..." -ForegroundColor Yellow
    git remote add origin $REPO_URL
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao configurar remote origin!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Remote origin configurado!" -ForegroundColor Green
} else {
    Write-Host "Remote origin ja configurado: $remoteUrl" -ForegroundColor Cyan
}

# Verificar status do repositorio
Write-Host "Verificando status do repositorio..." -ForegroundColor Yellow
git status --porcelain | Out-Null

# Adicionar todos os arquivos
Write-Host "Adicionando arquivos ao staging..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao adicionar arquivos!" -ForegroundColor Red
    exit 1
}

# Verificar se ha mudancas para commitar
$changes = git diff --cached --name-only
if (-not $changes) {
    Write-Host "Nenhuma mudanca detectada para commitar." -ForegroundColor Yellow
    Write-Host "Tentando fazer pull para sincronizar..." -ForegroundColor Yellow
    
    git pull origin $BRANCH
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Aviso: Falha no pull. Continuando com push..." -ForegroundColor Yellow
    }
} else {
    Write-Host "Fazendo commit das mudancas..." -ForegroundColor Yellow
    Write-Host "Mensagem: $message" -ForegroundColor Cyan
    
    git commit -m $message
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao fazer commit!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Commit realizado com sucesso!" -ForegroundColor Green
}

# Fazer push para o repositorio
Write-Host "Enviando para GitHub..." -ForegroundColor Yellow
if ($force) {
    git push origin $BRANCH --force
    Write-Host "Push forçado executado!" -ForegroundColor Yellow
} else {
    git push origin $BRANCH
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCESSO! Codigo enviado para GitHub!" -ForegroundColor Green
    Write-Host "Repositorio: $REPO_URL" -ForegroundColor Cyan
    Write-Host "Branch: $BRANCH" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Push automatico concluido com sucesso!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERRO: Falha no push para GitHub!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possiveis solucoes:" -ForegroundColor Yellow
    Write-Host "1. Verifique sua conexao com a internet" -ForegroundColor White
    Write-Host "2. Confirme suas credenciais do GitHub" -ForegroundColor White
    Write-Host "3. Execute 'npm run push:quick -- --force' para forcar o push" -ForegroundColor White
    Write-Host "4. Verifique se o repositorio existe e voce tem permissao" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   PUSH CONCLUIDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green