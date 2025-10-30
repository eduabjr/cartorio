import { Module } from '@nestjs/common'
import { ServicoCartorioController } from './servico-cartorio.controller'
import { ServicoCartorioService } from './servico-cartorio.service'

@Module({
  controllers: [ServicoCartorioController],
  providers: [ServicoCartorioService],
  exports: [ServicoCartorioService]
})
export class ServicoCartorioModule {}

