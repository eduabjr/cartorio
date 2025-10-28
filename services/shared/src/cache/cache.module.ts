import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * CacheModule - Módulo Global de Cache
 * 
 * @Global() torna o CacheService disponível em TODOS os módulos
 * sem precisar importar o CacheModule em cada um
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}

