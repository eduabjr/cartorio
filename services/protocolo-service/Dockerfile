# Dockerfile para Protocolo Service
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install --omit=dev

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Expor porta
EXPOSE 3003

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Comando de inicialização
CMD ["npm", "start"]

