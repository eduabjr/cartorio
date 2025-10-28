FROM node:18-alpine
WORKDIR /app

# Copiar shared module primeiro
COPY shared ./shared/

# Copiar package files do cliente-service
COPY cliente-service/package*.json ./
COPY cliente-service/prisma ./prisma/

# Instalar TODAS as dependências (incluindo dev para build)
RUN npm install

# Copiar código fonte do cliente-service
COPY cliente-service ./ 
RUN npx prisma generate
RUN npm run build

# Remover devDependencies após build (otimização)
RUN npm prune --production

EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
CMD ["npm", "start"]

