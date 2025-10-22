# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage de produção
FROM node:18-alpine AS production

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar build da aplicação
COPY --from=builder /app/dist ./dist

# Copiar schema do Prisma
COPY prisma ./prisma

# Gerar cliente Prisma
RUN npx prisma generate

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Mudar ownership dos arquivos
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"]
