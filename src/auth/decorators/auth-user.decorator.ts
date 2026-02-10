import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../dto/auth-user.dto';
import { Request } from 'express';
import { TokenPayload } from '../token/token.service';

export const AuthUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const payload = request.user as TokenPayload | undefined;

    if (!payload) {
      throw new UnauthorizedException('No user payload found in request');
    }

    return {
      id: payload.sub,
      role: payload.role,
    };
  },
);
