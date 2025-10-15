import { Controller, Post, Get, Body, Req, Res } from '@nestjs/common';
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
}
