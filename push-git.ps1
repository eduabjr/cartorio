# push-git.ps1
# Script simplificado para operações Git: add, commit e push

param(
    [string]$message = "Update automático - $(Get-Date -Format 'dd/MM/yyyy HH:mm')",
    [switch]$force = $false
)

# Função para exibir mensagens coloridas
function Write-Color {
    param (
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

$REPO_URL = "https://github.com/eduabjr/cartorio"
$BRANCH = "master"

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

# Configurar remote origin se não existir ou se a URL estiver incorreta
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
    Write-Color "" "White"
    Write-Color "🎉 SUCESSO! Código enviado para GitHub!" "Green"
    Write-Color "🌐 Repositório: $REPO_URL" "Cyan"
    Write-Color "🌿 Branch: $BRANCH" "Cyan"
    Write-Color "" "White"
    Write-Color "✅ Push automático concluído com sucesso!" "Green"
} else {
    Write-Color "" "White"
    Write-Color "❌ ERRO: Falha no push para GitHub!" "Red"
    Write-Color "" "White"
    Write-Color "Possíveis soluções:" "Yellow"
    Write-Color "1. Verifique sua conexão com a internet" "White"
    Write-Color "2. Confirme suas credenciais do GitHub" "White"
    Write-Color "3. Execute 'npm run push:quick -- --force' para forçar o push" "White"
    Write-Color "4. Verifique se o repositório existe e você tem permissão" "White"
    Write-Color "5. Se o branch remoto '$BRANCH' não existir, crie-o manualmente ou use 'git push -u origin $BRANCH' uma vez." "White"
    Write-Color "" "White"
    exit 1
}

Write-Color "" "White"
Write-Color "========================================" "Green"
Write-Color "   PUSH CONCLUÍDO!" "Green"
Write-Color "========================================" "Green"