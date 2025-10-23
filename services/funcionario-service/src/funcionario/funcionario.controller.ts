// funcionario.controller.ts
// Controller de funcionários

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common'
import { FuncionarioService } from './funcionario.service'
import { CreateFuncionarioDto, UpdateFuncionarioDto } from './funcionario.dto'

@Controller('funcionarios')
export class FuncionarioController {
  constructor(private readonly funcionarioService: FuncionarioService) {}

  @Post()
  create(@Body() createFuncionarioDto: CreateFuncionarioDto) {
    return this.funcionarioService.create(createFuncionarioDto)
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1
    const limitNumber = limit ? parseInt(limit, 10) : 10
    return this.funcionarioService.findAll(pageNumber, limitNumber, search)
  }

  @Get('search')
  searchByName(@Query('name') name: string) {
    return this.funcionarioService.searchByName(name)
  }

  @Get('stats')
  getStats() {
    return this.funcionarioService.getStats()
  }

  @Get('cpf/:cpf')
  findByCPF(@Param('cpf') cpf: string) {
    return this.funcionarioService.findByCPF(cpf)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.funcionarioService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFuncionarioDto: UpdateFuncionarioDto) {
    return this.funcionarioService.update(id, updateFuncionarioDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.funcionarioService.remove(id)
  }
}
