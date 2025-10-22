import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ClienteService } from './cliente.service';

@Controller('clientes')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.clienteService.findAll(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clienteService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.clienteService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.clienteService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.clienteService.remove(id);
  }
}

