import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_VERSION_KEY } from './api-version.decorator';

@Injectable()
export class VersioningGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredVersion = this.reflector.getAllAndOverride<string>(API_VERSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredVersion) {
      return true; // Se não há versão especificada, permite acesso
    }

    const request = context.switchToHttp().getRequest();
    const requestedVersion = this.extractVersionFromRequest(request);

    if (!requestedVersion) {
      throw new BadRequestException('Versão da API não especificada');
    }

    if (requestedVersion !== requiredVersion) {
      throw new BadRequestException(
        `Versão da API incompatível. Esperado: ${requiredVersion}, Recebido: ${requestedVersion}`
      );
    }

    return true;
  }

  private extractVersionFromRequest(request: any): string | null {
    // Extrair versão do header
    const headerVersion = request.headers['api-version'] || request.headers['x-api-version'];
    if (headerVersion) {
      return headerVersion;
    }

    // Extrair versão da URL
    const urlVersion = request.url.match(/\/v(\d+)\//);
    if (urlVersion) {
      return `v${urlVersion[1]}`;
    }

    // Extrair versão do query parameter
    const queryVersion = request.query.version;
    if (queryVersion) {
      return queryVersion;
    }

    return null;
  }
}
