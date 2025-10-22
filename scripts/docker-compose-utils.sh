#!/bin/bash

# Utilitários para gerenciar Docker Compose
# Uso: ./scripts/docker-compose-utils.sh [comando]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir ajuda
show_help() {
    echo -e "${BLUE}🐳 Docker Compose Utils - Sistema Cartório${NC}"
    echo ""
    echo "Comandos disponíveis:"
    echo ""
    echo "  ${GREEN}dev${NC}          - Iniciar ambiente de desenvolvimento"
    echo "  ${GREEN}prod${NC}         - Iniciar ambiente de produção"
    echo "  ${GREEN}test${NC}         - Executar testes em containers"
    echo "  ${GREEN}stop${NC}         - Parar todos os serviços"
    echo "  ${GREEN}restart${NC}      - Reiniciar todos os serviços"
    echo "  ${GREEN}logs${NC}         - Ver logs de todos os serviços"
    echo "  ${GREEN}status${NC}       - Ver status dos serviços"
    echo "  ${GREEN}clean${NC}        - Limpar containers e volumes"
    echo "  ${GREEN}backup${NC}       - Fazer backup do banco de dados"
    echo "  ${GREEN}restore${NC}      - Restaurar backup do banco de dados"
    echo "  ${GREEN}health${NC}       - Verificar saúde dos serviços"
    echo "  ${GREEN}scale${NC}        - Escalar serviços"
    echo "  ${GREEN}update${NC}       - Atualizar imagens e reiniciar"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/docker-compose-utils.sh dev"
    echo "  ./scripts/docker-compose-utils.sh logs api-gateway"
    echo "  ./scripts/docker-compose-utils.sh scale api-gateway=3"
}

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker primeiro.${NC}"
        exit 1
    fi
}

# Função para aguardar serviços estarem prontos
wait_for_services() {
    echo -e "${YELLOW}⏳ Aguardando serviços estarem prontos...${NC}"
    sleep 10
    
    # Verificar saúde dos serviços
    local services=("api-gateway:3000" "auth-service:3001" "user-service:3002")
    
    for service in "${services[@]}"; do
        local name=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)
        
        echo -e "${BLUE}🔍 Verificando $name...${NC}"
        
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -f http://localhost:$port/health &> /dev/null; then
                echo -e "${GREEN}✅ $name está pronto!${NC}"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                echo -e "${RED}❌ $name não ficou pronto após $max_attempts tentativas${NC}"
                return 1
            fi
            
            echo -e "${YELLOW}⏳ Tentativa $attempt/$max_attempts - $name ainda não está pronto...${NC}"
            sleep 2
            attempt=$((attempt + 1))
        done
    done
    
    echo -e "${GREEN}🎉 Todos os serviços estão prontos!${NC}"
}

# Comandos principais
case "$1" in
    "dev")
        echo -e "${BLUE}🚀 Iniciando ambiente de desenvolvimento...${NC}"
        check_docker
        docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
        wait_for_services
        echo -e "${GREEN}✅ Ambiente de desenvolvimento iniciado!${NC}"
        echo -e "${BLUE}📋 URLs disponíveis:${NC}"
        echo "  - API Gateway: http://localhost:3000"
        echo "  - Auth Service: http://localhost:3001"
        echo "  - User Service: http://localhost:3002"
        echo "  - Adminer: http://localhost:8080"
        echo "  - Redis Commander: http://localhost:8081"
        echo "  - MailHog: http://localhost:8025"
        ;;
    
    "prod")
        echo -e "${BLUE}🚀 Iniciando ambiente de produção...${NC}"
        check_docker
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        wait_for_services
        echo -e "${GREEN}✅ Ambiente de produção iniciado!${NC}"
        echo -e "${BLUE}📋 URLs disponíveis:${NC}"
        echo "  - API Gateway: https://localhost"
        echo "  - Grafana: http://localhost:3001"
        echo "  - Prometheus: http://localhost:9090"
        echo "  - Alertmanager: http://localhost:9093"
        ;;
    
    "test")
        echo -e "${BLUE}🧪 Executando testes...${NC}"
        check_docker
        docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
        echo -e "${GREEN}✅ Testes concluídos!${NC}"
        ;;
    
    "stop")
        echo -e "${YELLOW}⏹️  Parando todos os serviços...${NC}"
        docker-compose down
        echo -e "${GREEN}✅ Serviços parados!${NC}"
        ;;
    
    "restart")
        echo -e "${YELLOW}🔄 Reiniciando serviços...${NC}"
        docker-compose restart
        wait_for_services
        echo -e "${GREEN}✅ Serviços reiniciados!${NC}"
        ;;
    
    "logs")
        if [ -n "$2" ]; then
            echo -e "${BLUE}📋 Logs do serviço $2:${NC}"
            docker-compose logs -f "$2"
        else
            echo -e "${BLUE}📋 Logs de todos os serviços:${NC}"
            docker-compose logs -f
        fi
        ;;
    
    "status")
        echo -e "${BLUE}📊 Status dos serviços:${NC}"
        docker-compose ps
        echo ""
        echo -e "${BLUE}📊 Uso de recursos:${NC}"
        docker stats --no-stream
        ;;
    
    "clean")
        echo -e "${YELLOW}🧹 Limpando containers e volumes...${NC}"
        docker-compose down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✅ Limpeza concluída!${NC}"
        ;;
    
    "backup")
        echo -e "${BLUE}💾 Fazendo backup do banco de dados...${NC}"
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        docker-compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD:-root123} ${MYSQL_DATABASE:-cartorio} > "$BACKUP_FILE"
        echo -e "${GREEN}✅ Backup salvo em: $BACKUP_FILE${NC}"
        ;;
    
    "restore")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Por favor, especifique o arquivo de backup:${NC}"
            echo "Uso: $0 restore backup_file.sql"
            exit 1
        fi
        
        echo -e "${BLUE}📥 Restaurando backup: $2${NC}"
        docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD:-root123} ${MYSQL_DATABASE:-cartorio} < "$2"
        echo -e "${GREEN}✅ Backup restaurado!${NC}"
        ;;
    
    "health")
        echo -e "${BLUE}🏥 Verificando saúde dos serviços...${NC}"
        
        local services=("api-gateway:3000" "auth-service:3001" "user-service:3002")
        
        for service in "${services[@]}"; do
            local name=$(echo $service | cut -d: -f1)
            local port=$(echo $service | cut -d: -f2)
            
            if curl -f http://localhost:$port/health &> /dev/null; then
                echo -e "${GREEN}✅ $name: Saudável${NC}"
            else
                echo -e "${RED}❌ $name: Não saudável${NC}"
            fi
        done
        ;;
    
    "scale")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Por favor, especifique o serviço e número de réplicas:${NC}"
            echo "Uso: $0 scale service=replicas"
            echo "Exemplo: $0 scale api-gateway=3"
            exit 1
        fi
        
        echo -e "${BLUE}📈 Escalando serviço: $2${NC}"
        docker-compose up -d --scale "$2"
        echo -e "${GREEN}✅ Serviço escalado!${NC}"
        ;;
    
    "update")
        echo -e "${BLUE}🔄 Atualizando imagens...${NC}"
        docker-compose pull
        docker-compose up -d
        wait_for_services
        echo -e "${GREEN}✅ Atualização concluída!${NC}"
        ;;
    
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    
    *)
        echo -e "${RED}❌ Comando não reconhecido: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
