import { Controller, Post, Get, Body, Req, Res, Param } from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('auth/login')
  async login(@Body() loginData: any) {
    return this.gatewayService.proxyToAuthService('/auth/login', loginData);
  }

  @Post('auth/register')
  async register(@Body() registerData: any) {
    return this.gatewayService.proxyToAuthService('/auth/register', registerData);
  }

  @Get('users')
  async getUsers() {
    return this.gatewayService.proxyToUserService('/users');
  }

  @Post('users')
  async createUser(@Body() userData: any) {
    return this.gatewayService.proxyToUserService('/users', 'POST', userData);
  }

  // Rotas de Protocolos
  @Get('protocolos')
  async getProtocolos(@Req() req: any) {
    const queryString = req.url.split('?')[1] || '';
    return this.gatewayService.proxyToProtocoloService(`/protocolos?${queryString}`);
  }

  @Get('protocolos/:id')
  async getProtocolo(@Req() req: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToProtocoloService(`/protocolos/${id}`);
  }

  @Post('protocolos')
  async createProtocolo(@Body() data: any) {
    return this.gatewayService.proxyToProtocoloService('/protocolos', 'POST', data);
  }

  @Post('protocolos/:id/baixar')
  async baixarProtocolo(@Req() req: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToProtocoloService(`/protocolos/${id}/baixar`, 'POST');
  }

  @Post('protocolos/:id/cancelar')
  async cancelarProtocolo(@Req() req: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToProtocoloService(`/protocolos/${id}/cancelar`, 'POST');
  }

  // Rotas de Clientes
  @Get('clientes')
  async getClientes(@Req() req: any) {
    const queryString = req.url.split('?')[1] || '';
    return this.gatewayService.proxyToClienteService(`/clientes?${queryString}`);
  }

  @Get('clientes/:id')
  async getCliente(@Req() req: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToClienteService(`/clientes/${id}`);
  }

  @Post('clientes')
  async createCliente(@Body() data: any) {
    return this.gatewayService.proxyToClienteService('/clientes', 'POST', data);
  }

  // Rotas de Funcionários
  @Get('funcionarios')
  async getFuncionarios(@Req() req: any) {
    const queryString = req.url.split('?')[1] || '';
    return this.gatewayService.proxyToFuncionarioService(`/funcionarios?${queryString}`);
  }

  @Get('funcionarios/:id')
  async getFuncionario(@Req() req: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToFuncionarioService(`/funcionarios/${id}`);
  }

  @Post('funcionarios')
  async createFuncionario(@Body() data: any) {
    return this.gatewayService.proxyToFuncionarioService('/funcionarios', 'POST', data);
  }

  @Patch('funcionarios/:id')
  async updateFuncionario(@Req() req: any, @Body() data: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToFuncionarioService(`/funcionarios/${id}`, 'PATCH', data);
  }

  @Delete('funcionarios/:id')
  async deleteFuncionario(@Req() req: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToFuncionarioService(`/funcionarios/${id}`, 'DELETE');
  }

  @Get('funcionarios/search')
  async searchFuncionarios(@Req() req: any) {
    const queryString = req.url.split('?')[1] || '';
    return this.gatewayService.proxyToFuncionarioService(`/funcionarios/search?${queryString}`);
  }

  @Get('funcionarios/stats')
  async getFuncionarioStats() {
    return this.gatewayService.proxyToFuncionarioService('/funcionarios/stats');
  }

  // Health Check
  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: this.gatewayService.getServiceHealth(),
    };
  }
}
