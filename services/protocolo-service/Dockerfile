# Dockerfile para Protocolo Service
FROM node:18-alpine

WORKDIR /app

# Copiar shared module primeiro
COPY shared ./shared/

# Copiar arquivos de dependências
COPY protocolo-service/package*.json ./
COPY protocolo-service/prisma ./prisma/

# Instalar TODAS as dependências (incluindo dev para build)
RUN npm install

# Copiar código fonte
COPY protocolo-service ./

# Gerar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Remover devDependencies após build (otimização)
RUN npm prune --production

# Expor porta
EXPOSE 3003

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Comando de inicialização
CMD ["npm", "start"]

