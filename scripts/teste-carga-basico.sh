#!/bin/bash

# Script de Teste de Carga Básico
# Testa a capacidade do sistema de cartório em suportar múltiplos usuários

echo "=========================================="
echo "  TESTE DE CARGA - Sistema de Cartório"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
API_URL="${API_URL:-http://localhost:3000}"
DURATION="${DURATION:-60}"  # Duração em segundos
USERS="${USERS:-10}"  # Número de usuários simultâneos

# Verificar se o sistema está rodando
echo -e "${YELLOW}[1/5] Verificando se o sistema está online...${NC}"
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Sistema online${NC}"
else
    echo -e "${RED}✗ Sistema offline ou inacessível${NC}"
    echo "Certifique-se de que o sistema está rodando em $API_URL"
    exit 1
fi

# Verificar dependências
echo ""
echo -e "${YELLOW}[2/5] Verificando dependências...${NC}"

if command -v ab > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Apache Bench (ab) encontrado${NC}"
    TOOL="ab"
elif command -v wrk > /dev/null 2>&1; then
    echo -e "${GREEN}✓ wrk encontrado${NC}"
    TOOL="wrk"
elif command -v curl > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Apenas curl disponível (resultados limitados)${NC}"
    TOOL="curl"
else
    echo -e "${RED}✗ Nenhuma ferramenta de teste encontrada${NC}"
    echo ""
    echo "Instale uma das seguintes ferramentas:"
    echo "  - Apache Bench: apt-get install apache2-utils"
    echo "  - wrk: https://github.com/wg/wrk"
    exit 1
fi

# Teste de conectividade
echo ""
echo -e "${YELLOW}[3/5] Testando conectividade...${NC}"

RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$API_URL/health")
echo -e "${GREEN}✓ Tempo de resposta: ${RESPONSE_TIME}s${NC}"

# Executar teste de carga
echo ""
echo -e "${YELLOW}[4/5] Executando teste de carga...${NC}"
echo "Configuração:"
echo "  - URL: $API_URL"
echo "  - Duração: ${DURATION}s"
echo "  - Usuários simultâneos: $USERS"
echo ""

if [ "$TOOL" = "ab" ]; then
    # Apache Bench
    TOTAL_REQUESTS=$((USERS * DURATION * 10))
    echo "Executando Apache Bench..."
    echo "----------------------------------------"
    ab -n $TOTAL_REQUESTS -c $USERS -g results.tsv "$API_URL/health"
    
elif [ "$TOOL" = "wrk" ]; then
    # wrk
    echo "Executando wrk..."
    echo "----------------------------------------"
    wrk -t$USERS -c$USERS -d${DURATION}s --latency "$API_URL/health"
    
else
    # curl simples
    echo "Executando testes sequenciais com curl..."
    echo "----------------------------------------"
    
    TOTAL=0
    SUCCESS=0
    FAILED=0
    
    for i in $(seq 1 $USERS); do
        echo -n "Teste $i/$USERS... "
        
        HTTP_CODE=$(curl -o /dev/null -s -w '%{http_code}' "$API_URL/health")
        RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$API_URL/health")
        
        TOTAL=$((TOTAL + 1))
        
        if [ "$HTTP_CODE" = "200" ]; then
            SUCCESS=$((SUCCESS + 1))
            echo -e "${GREEN}OK${NC} (${RESPONSE_TIME}s)"
        else
            FAILED=$((FAILED + 1))
            echo -e "${RED}FALHOU${NC} (HTTP $HTTP_CODE)"
        fi
    done
    
    echo ""
    echo "Resumo:"
    echo "  Total: $TOTAL"
    echo "  Sucesso: $SUCCESS"
    echo "  Falhas: $FAILED"
fi

# Análise de resultados
echo ""
echo -e "${YELLOW}[5/5] Análise de resultados${NC}"
echo "----------------------------------------"

# Verificar métricas do sistema
echo ""
echo "Métricas do Docker (últimos containers):"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -n 8

echo ""
echo "=========================================="
echo "  Teste concluído!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "1. Analise os resultados acima"
echo "2. Acesse Grafana: http://localhost:3100"
echo "3. Acesse Prometheus: http://localhost:9090"
echo "4. Para teste mais avançado, use k6 ou JMeter"
echo ""

# Recomendações baseadas nos resultados
echo "Recomendações:"
echo ""

if [ "$TOOL" = "curl" ]; then
    echo "⚠️  Instale Apache Bench ou wrk para testes mais precisos:"
    echo "   sudo apt-get install apache2-utils  # Para ab"
    echo "   ou"
    echo "   https://github.com/wg/wrk  # Para wrk"
fi

echo ""
echo "Para testar com mais usuários:"
echo "  USERS=50 DURATION=120 ./scripts/teste-carga-basico.sh"
echo ""
echo "Para testar endpoint específico:"
echo "  API_URL=http://localhost:3000/api/clientes ./scripts/teste-carga-basico.sh"
echo ""

