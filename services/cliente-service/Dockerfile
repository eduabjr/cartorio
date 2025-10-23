FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
CMD ["npm", "start"]

