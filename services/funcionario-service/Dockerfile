# Dockerfile
# Dockerfile para o serviço de funcionários

FROM node:18-alpine

WORKDIR /app

# Copiar shared module primeiro
COPY shared ./shared/

# Copiar package files do funcionario-service
COPY funcionario-service/package*.json ./
COPY funcionario-service/prisma ./prisma/

# Instalar TODAS as dependências (incluindo dev para build)
RUN npm install

# Copiar código fonte do funcionario-service
COPY funcionario-service ./

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Remover devDependencies após build (otimização)
RUN npm prune --production

# Expor porta
EXPOSE 3005

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Comando de inicialização
CMD ["npm", "start"]
