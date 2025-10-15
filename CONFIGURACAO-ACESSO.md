# 🎯 Configuração e Acesso - Sistema de Cartório

## 📊 **Status Atual**

✅ **Frontend configurado e funcionando**  
✅ **Dockerfiles otimizados**  
✅ **Configurações Windows aplicadas**  
⚠️ **Docker Desktop com problemas de I/O**  
🔄 **Backend em configuração**

---

## 🚀 **Como Acessar o Sistema**

### **Opção 1: Desenvolvimento Local (RECOMENDADO)**

#### 1. **Frontend** (já funcionando)
```bash
cd frontend
npm run dev
```
**Acesso:** http://localhost:5173

#### 2. **Backend Services** (configurar agora)
```bash
# Terminal 1 - Auth Service
cd services/auth-service
npm install
npm run start:dev

# Terminal 2 - User Service  
cd services/user-service
npm install
npm run start:dev

# Terminal 3 - API Gateway
cd services/api-gateway
npm install
npm run start:dev
```

**Acessos Backend:**
- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3001
- User Service: http://localhost:3002

### **Opção 2: Docker (quando funcionando)**
```bash
# Ambiente mínimo
docker-compose -f docker-compose.minimal.yml up -d

# Ambiente simples
docker-compose -f docker-compose.simple.yml up -d
```

---

## 🔧 **Configurações Aplicadas**

### **1. Docker Compose**
- ✅ Suporte para Windows (`COMPOSE_CONVERT_WINDOWS_PATHS: 1`)
- ✅ Política de restart (`restart: unless-stopped`)
- ✅ Volumes otimizados (read-only para scripts init)
- ✅ URLs atualizadas para localhost

### **2. Dockerfiles**
- ✅ Otimização de dependências (`npm install` → `npm run build` → `npm prune --production`)
- ✅ Configurações de produção
- ✅ Arquivos `.dockerignore` criados

### **3. Frontend**
- ✅ Dependências instaladas
- ✅ Vite configurado com proxy para backend
- ✅ Servidor de desenvolvimento funcionando

### **4. Nginx**
- ✅ Configurações de performance
- ✅ Compressão Gzip
- ✅ Rate limiting
- ✅ Proxy reverso configurado

---

## 📁 **Arquivos de Configuração Criados**

### **Desenvolvimento**
- `dev-setup.md` - Guia completo de desenvolvimento
- `start-dev.ps1` - Script de configuração automática
- `env-examples/` - Exemplos de variáveis de ambiente

### **Docker**
- `.dockerignore` (raiz e serviços)
- Dockerfiles otimizados
- docker-compose files atualizados

### **Frontend**
- `vite.config.ts` - Configuração com proxy
- Dependências atualizadas

---

## 🎯 **Próximos Passos**

### **Imediato**
1. **Configurar PostgreSQL local**
2. **Instalar dependências dos serviços backend**
3. **Configurar variáveis de ambiente**
4. **Testar autenticação**

### **Médio Prazo**
1. **Implementar banco de dados**
2. **Configurar autenticação JWT**
3. **Testar integração frontend-backend**
4. **Deploy em produção**

---

## 🔍 **Verificação de Status**

### **Frontend** ✅
```bash
cd frontend
npm run dev
# Acessar: http://localhost:5173
```

### **Backend** 🔄
```bash
# Verificar se os serviços estão rodando
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service  
curl http://localhost:3002/health  # User Service
```

### **Docker** ⚠️
```bash
docker ps  # Verificar containers
docker-compose ps  # Status dos serviços
```

---

## 🛠️ **Comandos Úteis**

### **Desenvolvimento**
```bash
# Frontend
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview

# Backend
npm run start:dev    # Desenvolvimento
npm run build        # Build
npm run start:prod   # Produção

# Database
npx prisma studio    # Interface visual
npx prisma db push   # Sincronizar schema
```

### **Docker**
```bash
# Limpar Docker
docker system prune -a --force

# Logs
docker-compose logs -f [service]

# Restart
docker-compose restart [service]
```

---

## 📞 **Suporte**

### **Problemas Comuns**
1. **Docker I/O Errors** → Usar desenvolvimento local
2. **Permissões Windows** → Executar como Administrador
3. **Portas em uso** → Verificar com `netstat -ano`
4. **Dependências** → `npm install` em cada serviço

### **Logs e Debug**
- Frontend: Console do navegador
- Backend: Terminal de desenvolvimento
- Docker: `docker-compose logs -f`

---

## 🎉 **Resumo**

✅ **Sistema configurado para o novo caminho `F:\cartorio`**  
✅ **Frontend funcionando em http://localhost:5173**  
✅ **Configurações Docker otimizadas para Windows**  
✅ **Guias e scripts de desenvolvimento criados**  
✅ **Pronto para desenvolvimento local**

**O sistema está pronto para uso! Siga os próximos passos para configurar o backend.**
