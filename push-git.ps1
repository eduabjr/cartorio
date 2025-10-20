# push-git.ps1
# Script simplificado para operacoes Git: add, commit e push

param(
    [string]$message = "Update automatico - $(Get-Date -Format 'dd/MM/yyyy HH:mm')",
    [switch]$force = $false
)

# Funcao para exibir mensagens coloridas
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
Write-Color "   PUSH AUTOMATICO PARA GITHUB" "Green"
Write-Color "   Repositorio: $REPO_URL" "Cyan"
Write-Color "========================================" "Green"
Write-Color ""


# Verificar se o Git esta instalado
try {
    git --version | Out-Null
} catch {
    Write-Color "ERRO: Git nao encontrado. Por favor, instale o Git e configure-o." "Red"
    exit 1
}

# Verificar se estamos em um repositorio Git
if (-not (Test-Path ".git")) {
    Write-Color "ERRO: Este diretorio nao e um repositorio Git!" "Red"
    Write-Color "Inicializando repositorio Git..." "Yellow"
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Color "ERRO: Falha ao inicializar repositorio Git!" "Red"
        exit 1
    }
    Write-Color "Repositorio Git inicializado!" "Green"
}

# Configurar remote origin se nao existir ou se a URL estiver incorreta
$currentRemoteUrl = git config --get remote.origin.url 2>$null
if ($LASTEXITCODE -ne 0 -or $currentRemoteUrl -ne $REPO_URL) {
    if ($currentRemoteUrl) {
        Write-Color "Removendo remote 'origin' existente com URL incorreta: $currentRemoteUrl" "Yellow"
        git remote remove origin
    }
    Write-Color "Adicionando remote 'origin' com a URL correta: $REPO_URL" "Yellow"
    git remote add origin $REPO_URL
    if ($LASTEXITCODE -ne 0) {
        Write-Color "ERRO: Falha ao configurar remote origin!" "Red"
        exit 1
    }
    Write-Color "Remote origin configurado!" "Green"
} else {
    Write-Color "Remote origin ja configurado e correto: $currentRemoteUrl" "Cyan"
}

# Adicionar todos os arquivos
Write-Color "Adicionando arquivos ao staging..." "Yellow"
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Color "ERRO: Falha ao adicionar arquivos!" "Red"
    exit 1
}

# Verificar se ha mudancas para commitar
$changes = git diff --cached --name-only
if (-not $changes) {
    Write-Color "Nenhuma mudanca detectada para commitar." "Yellow"
    Write-Color "Tentando fazer pull para sincronizar..." "Yellow"
    git pull origin $BRANCH
    if ($LASTEXITCODE -ne 0) {
        Write-Color "Aviso: Falha no pull. Pode haver conflitos ou o branch remoto nao existe. Continuando com push..." "Yellow"
    }
} else {
    Write-Color "Fazendo commit das mudancas..." "Yellow"
    Write-Color "Mensagem: $message" "Cyan"
    git commit -m $message
    if ($LASTEXITCODE -ne 0) {
        Write-Color "ERRO: Falha ao fazer commit!" "Red"
        exit 1
    }
    Write-Color "Commit realizado com sucesso!" "Green"
}

# Fazer push para o repositorio
Write-Color "Enviando para GitHub..." "Yellow"
if ($force) {
    git push origin $BRANCH --force
    Write-Color "Push forcado executado!" "Yellow"
} else {
    git push origin $BRANCH
}

if ($LASTEXITCODE -eq 0) {
    Write-Color "" "White"
    Write-Color "SUCESSO! Codigo enviado para GitHub!" "Green"
    Write-Color "Repositorio: $REPO_URL" "Cyan"
    Write-Color "Branch: $BRANCH" "Cyan"
    Write-Color "" "White"
    Write-Color "Push automatico concluido com sucesso!" "Green"
} else {
    Write-Color "" "White"
    Write-Color "ERRO: Falha no push para GitHub!" "Red"
    Write-Color "" "White"
    Write-Color "Possiveis solucoes:" "Yellow"
    Write-Color "1. Verifique sua conexao com a internet" "White"
    Write-Color "2. Confirme suas credenciais do GitHub" "White"
    Write-Color "3. Execute 'npm run push:quick -- --force' para forcar o push" "White"
    Write-Color "4. Verifique se o repositorio existe e voce tem permissao" "White"
    Write-Color "5. Se o branch remoto '$BRANCH' nao existir, crie-o manualmente ou use 'git push -u origin $BRANCH' uma vez." "White"
    Write-Color "" "White"
    exit 1
}

Write-Color "" "White"
Write-Color "========================================" "Green"
Write-Color "   PUSH CONCLUIDO!" "Green"
Write-Color "========================================" "Green"