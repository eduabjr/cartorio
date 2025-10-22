#!/bin/bash

# Script para aguardar serviços estarem prontos
echo "⏳ Aguardando serviços estarem prontos..."

# Função para aguardar um serviço
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=1

    echo "🔍 Verificando $service_name em $host:$port..."

    while [ $attempt -le $max_attempts ]; do
        if nc -z $host $port 2>/dev/null; then
            echo "✅ $service_name está pronto!"
            return 0
        fi
        
        echo "⏳ Tentativa $attempt/$max_attempts - $service_name ainda não está pronto..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "❌ $service_name não ficou pronto após $max_attempts tentativas"
    return 1
}

# Aguardar MySQL
wait_for_service "mysql-test" "3306" "MySQL"

# Aguardar Redis
wait_for_service "redis-test" "6379" "Redis"

# Aguardar Auth Service
wait_for_service "auth-service-test" "3001" "Auth Service"

# Aguardar User Service
wait_for_service "user-service-test" "3002" "User Service"

# Aguardar API Gateway
wait_for_service "api-gateway-test" "3000" "API Gateway"

echo "🎉 Todos os serviços estão prontos!"
