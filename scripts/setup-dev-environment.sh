#!/bin/bash

# Script para configurar ambiente de desenvolvimento
echo "🚀 Configurando ambiente de desenvolvimento do Sistema Cartório..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Pré-requisitos verificados"

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "⚠️  Por favor, edite o arquivo .env com suas configurações"
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Instalar dependências dos serviços
echo "📦 Instalando dependências dos serviços..."
cd services/api-gateway && npm install && cd ../..
cd services/auth-service && npm install && cd ../..
cd services/user-service && npm install && cd ../..

# Construir imagens Docker
echo "🐳 Construindo imagens Docker..."
docker-compose -f docker-compose.dev.yml build

# Iniciar serviços de desenvolvimento
echo "🚀 Iniciando serviços de desenvolvimento..."
docker-compose -f docker-compose.dev.yml up -d mysql-dev redis-dev

# Aguardar serviços estarem prontos
echo "⏳ Aguardando serviços estarem prontos..."
sleep 10

# Executar migrações do banco
echo "🗄️  Executando migrações do banco de dados..."
cd services/auth-service && npx prisma migrate dev --name init && cd ../..
cd services/user-service && npx prisma migrate dev --name init && cd ../..

echo "✅ Ambiente de desenvolvimento configurado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo .env com suas configurações"
echo "2. Execute: docker-compose -f docker-compose.dev.yml up"
echo "3. Acesse: http://localhost:3000"
echo ""
echo "🔧 Comandos úteis:"
echo "- Ver logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "- Parar serviços: docker-compose -f docker-compose.dev.yml down"
echo "- Executar testes: npm test"
echo "- Executar linting: npm run lint"
