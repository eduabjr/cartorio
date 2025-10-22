import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProtocoloService } from './protocolo.service';
import { CreateProtocoloDto, UpdateProtocoloDto } from './protocolo.dto';

@Controller('protocolos')
export class ProtocoloController {
  constructor(private readonly protocoloService: ProtocoloService) {}

  @Get()
  async findAll(@Query('tipo') tipo?: string, @Query('status') status?: string) {
    return this.protocoloService.findAll({ tipo, status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.protocoloService.findOne(id);
  }

  @Post()
  async create(@Body() data: CreateProtocoloDto) {
    return this.protocoloService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateProtocoloDto) {
    return this.protocoloService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.protocoloService.remove(id);
  }

  @Post(':id/baixar')
  async baixar(@Param('id') id: string) {
    return this.protocoloService.baixar(id);
  }

  @Post(':id/cancelar')
  async cancelar(@Param('id') id: string) {
    return this.protocoloService.cancelar(id);
  }

  @Get(':id/historico')
  async historico(@Param('id') id: string) {
    return this.protocoloService.getHistorico(id);
  }
}

