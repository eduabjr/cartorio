# Sistema de Cartório - Microsserviços

Sistema robusto e escalável para cartórios baseado em arquitetura de microsserviços.

## 🏗️ Arquitetura

### Microsserviços

1. **Auth Service** (Porta 3001) - Autenticação e autorização
2. **User Service** (Porta 3002) - Gerenciamento de usuários
3. **Document Service** (Porta 3003) - Gestão de documentos
4. **Registry Service** (Porta 3004) - Registros cartoriais
5. **Payment Service** (Porta 3005) - Processamento de pagamentos
6. **Notification Service** (Porta 3006) - Sistema de notificações
7. **API Gateway** (Porta 3000) - Gateway de API
8. **Frontend** (Porta 3007) - Interface web

### Infraestrutura

- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e sessões
- **RabbitMQ** - Mensageria assíncrona
- **Nginx** - Proxy reverso e balanceamento de carga

## 🌐 Desenvolvimento via Rede Local

### Opção 1: Script Automático (Recomendado)
```bash
# Execute o script para modo rede
start-network.bat
```

### Opção 2: Manual
```bash
# 1. Configure o Vite para aceitar conexões de rede
# (já configurado no vite.config.ts)

# 2. Inicie os serviços
docker-compose up -d

# 3. Acesse via IP da rede local
# Frontend: http://192.168.15.192:3007
```

### Vantagens do Acesso via Rede:
- ✅ Teste em dispositivos móveis (celular/tablet)
- ✅ Demonstração para clientes em outros computadores
- ✅ Desenvolvimento colaborativo
- ✅ Teste de responsividade em diferentes telas
- ✅ Hot reload funciona em todos os dispositivos

### Requisitos:
- Todos os dispositivos devem estar na mesma rede Wi-Fi
- Firewall do Windows deve permitir conexões na porta 3007
- Docker Desktop deve estar rodando

## 🚀 Tecnologias

### Backend
- **Node.js** + **TypeScript**
- **NestJS** - Framework para microsserviços
- **Express.js** - Servidor web
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Winston** - Logs

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado
- **React Router** - Roteamento

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** - Proxy reverso
- **PM2** - Process manager

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Git

## 🛠️ Instalação e Execução

### 1. Clone o repositório
```bash
git clone <repository-url>
cd sistema-cartorio-microservices
```

### 2. Instale as dependências
```bash
npm run install-all
```

### 3. Execute com Docker
```bash
npm run dev
```

### 4. Acesse o sistema

#### 🌐 Links de Acesso (Localhost)
- **Frontend (Interface Principal)**: http://localhost:3007
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **User Service**: http://localhost:3002
- **PostgreSQL**: localhost:5432
- **RabbitMQ Management**: http://localhost:15672

#### 🌍 Links de Acesso (Rede Local)
- **Frontend (Interface Principal)**: http://192.168.15.192:3007
- **API Gateway**: http://192.168.15.192:3000
- **Auth Service**: http://192.168.15.192:3001
- **User Service**: http://192.168.15.192:3002
- **PostgreSQL**: 192.168.15.192:5432
- **RabbitMQ Management**: http://192.168.15.192:15672

> **💡 Dica**: Use os links de rede local para acessar o sistema de outros dispositivos na mesma rede Wi-Fi (celular, tablet, outros computadores).

#### 🔐 Credenciais de Login
- **Email**: `admin@cartorio.com`
- **Senha**: `admin123` (ou qualquer senha para teste)

#### 📋 Informações do Sistema
- **Nome**: Sistema Cartório
- **Tecnologia**: Tecnologia da Informação
- **Endereço**: Rua Yara, 49 - São João
- **CEP**: 17513-370 - Marília/SP
- **Telefone**: (14) 3216-2611

## 📁 Estrutura do Projeto

```
sistema-cartorio-microservices/
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── document-service/
│   ├── registry-service/
│   ├── payment-service/
│   ├── notification-service/
│   └── api-gateway/
├── frontend/
├── shared/
├── database/
├── nginx/
├── docker-compose.yml
└── package.json
```

## 🧪 Como Testar o Sistema

### 1. Iniciar os Serviços
```bash
# Iniciar PostgreSQL
docker run -d --name postgres-cartorio -e POSTGRES_DB=cartorio_db -e POSTGRES_USER=cartorio_user -e POSTGRES_PASSWORD=cartorio_password -p 5432:5432 postgres:15-alpine

# Iniciar Frontend
docker run -d --name frontend -p 3007:3000 -v "C:\Users\Usuário\Desktop\projeto sistema cartorio\frontend:/app" -w /app node:18-alpine sh -c "cd /app && npm install && npm run dev"
```

### 2. Verificar Status
```bash
docker ps
```

### 3. Acessar o Sistema
1. Abra o navegador
2. Acesse: http://localhost:3007
3. Faça login com as credenciais fornecidas
4. Explore as funcionalidades do sistema

## 🖥️ Aplicação Desktop (Electron)

### Criar Executável (.exe)

Para criar um executável do sistema que pode ser instalado diretamente no Windows:

```bash
# Execute o script de build
build-electron.bat
```

O executável será gerado em `frontend/dist-electron/`

### Executar em Modo Desenvolvimento

Para testar a aplicação desktop em modo desenvolvimento:

```bash
# Execute o script de desenvolvimento
run-electron-dev.bat
```

### Vantagens da Aplicação Desktop:
- ✅ Instalação direta no Windows
- ✅ Não precisa de navegador
- ✅ Acesso offline (com dados locais)
- ✅ Interface nativa do Windows
- ✅ Atalhos no menu iniciar e desktop

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia todos os serviços
- `npm run build` - Constrói as imagens Docker
- `npm run stop` - Para todos os serviços
- `npm run logs` - Visualiza logs dos serviços
- `npm run install-all` - Instala dependências de todos os serviços
- `build-electron.bat` - Cria executável desktop
- `run-electron-dev.bat` - Executa aplicação desktop em desenvolvimento

## 🗄️ Banco de Dados

### Configuração
- **Host**: localhost:5432
- **Database**: cartorio_db
- **User**: cartorio_user
- **Password**: cartorio_password

### Migrações
```bash
cd services/[service-name]
npx prisma migrate dev
```

## 🔐 Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Validação de entrada
- CORS configurado
- Headers de segurança

## 📊 Monitoramento

- Logs estruturados com Winston
- Métricas de performance
- Health checks nos serviços

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão no Frontend
```bash
# Verificar se o container está rodando
docker ps

# Ver logs do frontend
docker logs frontend

# Reiniciar o container
docker restart frontend
```

#### 2. Erro de Tailwind CSS
```bash
# Corrigir erro de border-border
docker exec -it frontend sh -c "cd /app && sed -i 's/@apply border-border;/\/\* @apply border-border; \*\//' src/index.css"
docker restart frontend
```

#### 3. PostgreSQL não Conecta
```bash
# Verificar se o PostgreSQL está rodando
docker ps | grep postgres

# Iniciar o PostgreSQL
docker start postgres-cartorio
```

#### 4. Porta já em Uso
```bash
# Parar todos os containers
docker stop $(docker ps -q)

# Remover containers parados
docker rm $(docker ps -aq)
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através dos canais oficiais do projeto.