import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GatewayService {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
  private readonly userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';

  async proxyToAuthService(path: string, data?: any) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.authServiceUrl}${path}`,
        data,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async proxyToUserService(path: string, method: string = 'GET', data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.userServiceUrl}${path}`,
        data,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}
