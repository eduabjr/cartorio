#!/bin/bash

# Script para deploy em produção
echo "🚀 Iniciando deploy em produção..."

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Deploy só pode ser feito da branch main. Branch atual: $CURRENT_BRANCH"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "❌ Há mudanças não commitadas. Por favor, faça commit antes do deploy."
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker."
    exit 1
fi

# Fazer backup do banco de dados
echo "💾 Fazendo backup do banco de dados..."
docker-compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} > backup_$(date +%Y%m%d_%H%M%S).sql

# Parar serviços atuais
echo "⏹️  Parando serviços atuais..."
docker-compose down

# Fazer pull das últimas imagens
echo "📥 Fazendo pull das últimas imagens..."
docker-compose pull

# Construir novas imagens
echo "🔨 Construindo novas imagens..."
docker-compose build --no-cache

# Iniciar serviços
echo "🚀 Iniciando serviços..."
docker-compose up -d

# Aguardar serviços estarem prontos
echo "⏳ Aguardando serviços estarem prontos..."
sleep 30

# Verificar saúde dos serviços
echo "🏥 Verificando saúde dos serviços..."
HEALTH_CHECK_FAILED=0

# Verificar API Gateway
if ! curl -f http://localhost:3000/health &> /dev/null; then
    echo "❌ API Gateway não está respondendo"
    HEALTH_CHECK_FAILED=1
fi

# Verificar Auth Service
if ! curl -f http://localhost:3001/health &> /dev/null; then
    echo "❌ Auth Service não está respondendo"
    HEALTH_CHECK_FAILED=1
fi

# Verificar User Service
if ! curl -f http://localhost:3002/health &> /dev/null; then
    echo "❌ User Service não está respondendo"
    HEALTH_CHECK_FAILED=1
fi

if [ $HEALTH_CHECK_FAILED -eq 1 ]; then
    echo "❌ Deploy falhou - alguns serviços não estão saudáveis"
    echo "🔄 Fazendo rollback..."
    docker-compose down
    docker-compose up -d
    exit 1
fi

echo "✅ Deploy realizado com sucesso!"
echo ""
echo "📊 Status dos serviços:"
echo "- API Gateway: http://localhost:3000"
echo "- Auth Service: http://localhost:3001"
echo "- User Service: http://localhost:3002"
echo "- Grafana: http://localhost:3001"
echo "- Prometheus: http://localhost:9090"
echo ""
echo "📋 Comandos úteis:"
echo "- Ver logs: docker-compose logs -f"
echo "- Ver status: docker-compose ps"
echo "- Parar serviços: docker-compose down"
