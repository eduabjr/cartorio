// natureza.controller.ts
// Controller de naturezas de serviços

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common'
import { NaturezaService } from './natureza.service'
import { CreateNaturezaDto, UpdateNaturezaDto } from './natureza.dto'

@Controller('naturezas')
export class NaturezaController {
  constructor(private readonly naturezaService: NaturezaService) {}

  @Post()
  create(@Body() createNaturezaDto: CreateNaturezaDto) {
    return this.naturezaService.create(createNaturezaDto)
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1
    const limitNumber = limit ? parseInt(limit, 10) : 100
    return this.naturezaService.findAll(pageNumber, limitNumber, search)
  }

  @Get('ativas')
  findActive() {
    return this.naturezaService.findActive()
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.naturezaService.findByCodigo(codigo)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.naturezaService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNaturezaDto: UpdateNaturezaDto) {
    return this.naturezaService.update(id, updateNaturezaDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.naturezaService.remove(id)
  }
}

