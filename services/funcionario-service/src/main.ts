// main.ts
// Ponto de entrada do serviço de funcionários

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // Configurar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })

  // Configurar prefixo global
  app.setGlobalPrefix('api')

  // Configurar porta
  const port = process.env.PORT || 3005
  await app.listen(port)
  
  console.log(`🚀 Funcionário Service rodando na porta ${port}`)
  console.log(`📋 Health Check: http://localhost:${port}/health`)
}

bootstrap()
