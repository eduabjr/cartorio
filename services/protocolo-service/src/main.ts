import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3003;
  await app.listen(port);
  
  console.log(`🚀 Protocolo Service rodando na porta ${port}`);
}

bootstrap();

