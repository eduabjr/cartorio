import { Controller, Post, Get, Patch, Delete, Body, Req, Res, Param } from '@nestjs/common';
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

  // Rotas de Naturezas
  @Get('naturezas')
  async getNaturezas(@Req() req: any) {
    const queryString = req.url.split('?')[1] || '';
    return this.gatewayService.proxyToNaturezaService(`/naturezas?${queryString}`);
  }

  @Get('naturezas/ativas')
  async getNaturezasAtivas() {
    return this.gatewayService.proxyToNaturezaService('/naturezas/ativas');
  }

  @Get('naturezas/codigo/:codigo')
  async getNaturezaByCodigo(@Req() req: any) {
    const codigo = req.params.codigo;
    return this.gatewayService.proxyToNaturezaService(`/naturezas/codigo/${codigo}`);
  }

  @Get('naturezas/:id')
  async getNatureza(@Req() req: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToNaturezaService(`/naturezas/${id}`);
  }

  @Post('naturezas')
  async createNatureza(@Body() data: any) {
    return this.gatewayService.proxyToNaturezaService('/naturezas', 'POST', data);
  }

  @Patch('naturezas/:id')
  async updateNatureza(@Req() req: any, @Body() data: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToNaturezaService(`/naturezas/${id}`, 'PATCH', data);
  }

  @Delete('naturezas/:id')
  async deleteNatureza(@Req() req: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToNaturezaService(`/naturezas/${id}`, 'DELETE');
  }

  // Rotas de Serviços de Cartório
  @Get('servicos-cartorio')
  async getServicosCartorio(@Req() req: any) {
    const queryString = req.url.split('?')[1] || '';
    return this.gatewayService.proxyToNaturezaService(`/servicos-cartorio?${queryString}`);
  }

  @Get('servicos-cartorio/ativos')
  async getServicosCartorioAtivos() {
    return this.gatewayService.proxyToNaturezaService('/servicos-cartorio/ativos');
  }

  @Get('servicos-cartorio/natureza/:naturezaId')
  async getServicosByNatureza(@Req() req: any) {
    const naturezaId = req.params.naturezaId;
    return this.gatewayService.proxyToNaturezaService(`/servicos-cartorio/natureza/${naturezaId}`);
  }

  @Get('servicos-cartorio/codigo/:codigo')
  async getServicoCartorioByCodigo(@Req() req: any) {
    const codigo = req.params.codigo;
    return this.gatewayService.proxyToNaturezaService(`/servicos-cartorio/codigo/${codigo}`);
  }

  @Get('servicos-cartorio/:id')
  async getServicoCartorio(@Req() req: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToNaturezaService(`/servicos-cartorio/${id}`);
  }

  @Post('servicos-cartorio')
  async createServicoCartorio(@Body() data: any) {
    return this.gatewayService.proxyToNaturezaService('/servicos-cartorio', 'POST', data);
  }

  @Patch('servicos-cartorio/:id')
  async updateServicoCartorio(@Req() req: any, @Body() data: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToNaturezaService(`/servicos-cartorio/${id}`, 'PATCH', data);
  }

  @Delete('servicos-cartorio/:id')
  async deleteServicoCartorio(@Req() req: any) {
    const id = req.params.id;
    return this.gatewayService.proxyToNaturezaService(`/servicos-cartorio/${id}`, 'DELETE');
  }

  // Health Check
  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
