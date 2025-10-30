// servico-cartorio.controller.ts
// Controller de serviços de cartório

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common'
import { ServicoCartorioService } from './servico-cartorio.service'
import { CreateServicoCartorioDto, UpdateServicoCartorioDto } from './servico-cartorio.dto'

@Controller('servicos-cartorio')
export class ServicoCartorioController {
  constructor(private readonly servicoCartorioService: ServicoCartorioService) {}

  @Post()
  create(@Body() createServicoDto: CreateServicoCartorioDto) {
    return this.servicoCartorioService.create(createServicoDto)
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('naturezaId') naturezaId?: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1
    const limitNumber = limit ? parseInt(limit, 10) : 100
    return this.servicoCartorioService.findAll(pageNumber, limitNumber, search, naturezaId)
  }

  @Get('ativos')
  findActive() {
    return this.servicoCartorioService.findActive()
  }

  @Get('natureza/:naturezaId')
  findByNatureza(@Param('naturezaId') naturezaId: string) {
    return this.servicoCartorioService.findByNatureza(naturezaId)
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.servicoCartorioService.findByCodigo(codigo)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicoCartorioService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServicoDto: UpdateServicoCartorioDto) {
    return this.servicoCartorioService.update(id, updateServicoDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.servicoCartorioService.remove(id)
  }
}

