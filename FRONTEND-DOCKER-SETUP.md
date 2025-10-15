# 🐳 Frontend no Docker - Sistema de Cartório

## 📋 **Configuração Criada**

✅ **Dockerfile otimizado** com multi-stage build  
✅ **Configuração Nginx** para produção  
✅ **Docker Compose** específico para frontend  
✅ **Scripts de build** preparados  

---

## 🚀 **Como Executar o Frontend no Docker**

### **Opção 1: Docker Compose (Recomendado)**

```bash
# Executar frontend apenas
docker-compose -f docker-compose.frontend-only.yml up --build -d

# Verificar status
docker-compose -f docker-compose.frontend-only.yml ps

# Ver logs
docker-compose -f docker-compose.frontend-only.yml logs -f frontend
```

**Acesso:** http://localhost:3000

### **Opção 2: Build Manual**

```bash
# Build da imagem
docker build -t cartorio-frontend ./frontend

# Executar container
docker run -d -p 3000:80 --name cartorio-frontend cartorio-frontend

# Verificar status
docker ps
```

### **Opção 3: Docker Compose Completo**

```bash
# Executar com todos os serviços
docker-compose -f docker-compose.frontend.yml up --build -d
```

---

## 🔧 **Configurações Implementadas**

### **1. Dockerfile Multi-Stage**

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **2. Configuração Nginx**

- ✅ **Gzip compression** para melhor performance
- ✅ **Cache de assets estáticos** (1 ano)
- ✅ **Headers de segurança** (CSP, XSS Protection)
- ✅ **Roteamento SPA** (try_files)
- ✅ **Proxy para API** (/api/*)
- ✅ **Health check** (/health)

### **3. Docker Compose**

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: cartorio-frontend
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - cartorio-network
```

---

## 🐛 **Solução de Problemas**

### **Problema: Docker Desktop I/O Errors**

**Sintomas:**
```
failed to solve: write /var/lib/desktop-containerd/daemon/io.containerd.metadata.v1.bolt/meta.db: input/output error
```

**Soluções:**

#### **1. Reiniciar Docker Desktop**
```bash
# Parar Docker Desktop
# Reiniciar Docker Desktop
# Aguardar inicialização completa
```

#### **2. Limpar Docker**
```bash
# Limpar containers parados
docker container prune -f

# Limpar imagens não utilizadas
docker image prune -f

# Limpar volumes não utilizados
docker volume prune -f

# Limpeza completa (CUIDADO!)
docker system prune -a --force
```

#### **3. Verificar Espaço em Disco**
```bash
# Verificar espaço disponível
docker system df

# Verificar uso de disco
df -h
```

#### **4. Alternativa: WSL2**
```bash
# Instalar WSL2
wsl --install

# Configurar Docker Desktop para usar WSL2
# Settings > General > Use the WSL 2 based engine
```

### **Problema: Build Falha**

**Soluções:**

#### **1. Verificar Dependências**
```bash
cd frontend
npm install
npm run build
```

#### **2. Limpar Cache npm**
```bash
npm cache clean --force
```

#### **3. Verificar Node.js**
```bash
node --version  # Deve ser >= 18.0.0
npm --version   # Deve ser >= 9.0.0
```

### **Problema: Container Não Inicia**

**Soluções:**

#### **1. Verificar Logs**
```bash
docker logs cartorio-frontend
```

#### **2. Verificar Portas**
```bash
# Verificar se porta 3000 está livre
netstat -ano | findstr :3000

# Matar processo se necessário
taskkill /PID [PID] /F
```

#### **3. Verificar Imagem**
```bash
# Listar imagens
docker images

# Remover imagem corrompida
docker rmi cartorio-frontend
```

---

## 🌐 **Acessos e URLs**

### **Frontend**
- **Produção:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

### **APIs (quando backend estiver rodando)**
- **API Gateway:** http://localhost:3000/api/*
- **Auth Service:** http://localhost:3001
- **User Service:** http://localhost:3002

---

## 📊 **Monitoramento**

### **Verificar Status**
```bash
# Status dos containers
docker ps

# Status específico
docker-compose -f docker-compose.frontend-only.yml ps

# Logs em tempo real
docker-compose -f docker-compose.frontend-only.yml logs -f
```

### **Métricas de Performance**
```bash
# Uso de recursos
docker stats cartorio-frontend

# Informações do container
docker inspect cartorio-frontend
```

---

## 🔄 **Comandos Úteis**

### **Desenvolvimento**
```bash
# Build e execução
docker-compose -f docker-compose.frontend-only.yml up --build

# Apenas build
docker-compose -f docker-compose.frontend-only.yml build

# Parar serviços
docker-compose -f docker-compose.frontend-only.yml down

# Parar e remover volumes
docker-compose -f docker-compose.frontend-only.yml down -v
```

### **Manutenção**
```bash
# Atualizar dependências
docker-compose -f docker-compose.frontend-only.yml pull

# Rebuild sem cache
docker-compose -f docker-compose.frontend-only.yml build --no-cache

# Remover tudo
docker-compose -f docker-compose.frontend-only.yml down --rmi all --volumes --remove-orphans
```

---

## 🎯 **Próximos Passos**

1. **Resolver problemas do Docker Desktop** (I/O errors)
2. **Testar build do frontend** em ambiente limpo
3. **Configurar backend** para integração completa
4. **Implementar CI/CD** para deploy automático

---

## 📝 **Notas Importantes**

- ⚠️ **Docker Desktop** está com problemas de I/O no sistema
- ✅ **Configuração está pronta** para quando Docker funcionar
- 🔄 **Alternativa:** Usar desenvolvimento local (já funcionando)
- 🐳 **Multi-stage build** otimiza tamanho da imagem
- 🚀 **Nginx** garante performance em produção

---

## 🆘 **Suporte**

Se os problemas persistirem:

1. **Reiniciar Docker Desktop**
2. **Verificar espaço em disco**
3. **Usar desenvolvimento local** como alternativa
4. **Considerar WSL2** para melhor compatibilidade
