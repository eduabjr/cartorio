# 🚀 Configuração de Desenvolvimento - Sistema de Cartório

## 📋 Pré-requisitos

### 1. Node.js e npm
```bash
# Verificar versões
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### 2. PostgreSQL
```bash
# Instalar PostgreSQL 15+
# Criar banco de dados
createdb cartorio_db
```

### 3. Docker (Opcional - se funcionando)
```bash
docker --version
docker-compose --version
```

## 🔧 Configuração do Ambiente

### 1. Configurar Variáveis de Ambiente

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
```

Editar `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:3000
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_USER_SERVICE_URL=http://localhost:3002
VITE_APP_ENV=development
```

#### Backend - Auth Service
```bash
cd services/auth-service
cp .env.example .env
```

Editar `services/auth-service/.env`:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://usuario:senha@localhost:5432/cartorio_db
JWT_SECRET=seu-jwt-secret-aqui
JWT_EXPIRES_IN=24h
```

#### Backend - User Service
```bash
cd services/user-service
cp .env.example .env
```

Editar `services/user-service/.env`:
```env
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://usuario:senha@localhost:5432/cartorio_db
JWT_SECRET=seu-jwt-secret-aqui
```

#### Backend - API Gateway
```bash
cd services/api-gateway
cp .env.example .env
```

Editar `services/api-gateway/.env`:
```env
NODE_ENV=development
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
```

## 🚀 Executando o Sistema

### Opção 1: Desenvolvimento Local (Recomendado)

#### 1. Instalar Dependências
```bash
# Frontend
cd frontend
npm install

# Auth Service
cd ../services/auth-service
npm install

# User Service
cd ../user-service
npm install

# API Gateway
cd ../api-gateway
npm install
```

#### 2. Configurar Banco de Dados
```bash
# Na pasta do auth-service
cd services/auth-service
npx prisma generate
npx prisma db push

# Na pasta do user-service
cd ../user-service
npx prisma generate
npx prisma db push
```

#### 3. Executar Serviços

**Terminal 1 - Auth Service:**
```bash
cd services/auth-service
npm run start:dev
```

**Terminal 2 - User Service:**
```bash
cd services/user-service
npm run start:dev
```

**Terminal 3 - API Gateway:**
```bash
cd services/api-gateway
npm run start:dev
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
```

### Opção 2: Docker (Se funcionando)

#### 1. Limpar Docker
```bash
docker system prune -a --force
```

#### 2. Executar com Docker Compose
```bash
# Ambiente mínimo (apenas auth + postgres)
docker-compose -f docker-compose.minimal.yml up -d

# Ambiente simples (auth + user + postgres + frontend)
docker-compose -f docker-compose.simple.yml up -d

# Ambiente completo
docker-compose up -d
```

## 🌐 Acessos

### Desenvolvimento Local
- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:3000
- **Auth Service:** http://localhost:3001
- **User Service:** http://localhost:3002
- **PostgreSQL:** localhost:5432

### Docker
- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:3000
- **PostgreSQL:** localhost:5432

## 🔧 Comandos Úteis

### Frontend
```bash
cd frontend
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview build
npm run lint         # Linter
```

### Backend
```bash
cd services/[service-name]
npm run start:dev    # Desenvolvimento
npm run build        # Build
npm run start:prod   # Produção
npm run test         # Testes
```

### Database
```bash
cd services/[service-name]
npx prisma studio    # Interface visual do banco
npx prisma db push   # Sincronizar schema
npx prisma generate  # Gerar cliente
```

## 🐛 Solução de Problemas

### Docker com Problemas de I/O
```bash
# Reiniciar Docker Desktop
# Ou usar desenvolvimento local
```

### Problemas de Permissão no Windows
```bash
# Executar PowerShell como Administrador
# Ou usar WSL2
```

### Portas em Uso
```bash
# Verificar portas em uso
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Matar processo
taskkill /PID [PID] /F
```

## 📝 Notas Importantes

1. **Desenvolvimento Local** é mais estável que Docker no Windows
2. **PostgreSQL** deve estar rodando localmente
3. **Variáveis de ambiente** devem ser configuradas corretamente
4. **Portas** devem estar livres (3000, 3001, 3002, 5173, 5432)
5. **Node.js 18+** é necessário para compatibilidade

## 🎯 Próximos Passos

1. Configurar banco de dados
2. Executar migrações
3. Testar endpoints
4. Configurar autenticação
5. Testar frontend
