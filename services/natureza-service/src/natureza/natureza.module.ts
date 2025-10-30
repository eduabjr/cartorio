import { Module } from '@nestjs/common'
import { NaturezaController } from './natureza.controller'
import { NaturezaService } from './natureza.service'

@Module({
  controllers: [NaturezaController],
  providers: [NaturezaService],
  exports: [NaturezaService]
})
export class NaturezaModule {}

