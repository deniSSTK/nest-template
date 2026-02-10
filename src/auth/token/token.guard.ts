import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenPayload, TokenService } from './token.service';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: Express.User & TokenPayload;
}

@Injectable()
export class TokenGuard implements CanActivate {
  private readonly logger = new Logger(TokenGuard.name);

  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('No token provided');
      throw new UnauthorizedException('No token provided');
    }

    const payload = await this.tokenService.getAccessPayload(token);
    if (!payload) {
      this.logger.warn('Invalid token provided');
      throw new UnauthorizedException('Invalid token provided');
    }

    request.user = payload;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
