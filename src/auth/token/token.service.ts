import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../core/config/config.service';
import ms, { StringValue } from 'ms';
import { AuthenticatedUser } from '../dto/auth-user.dto';
import { TokensResDto } from '../dto/response/tokens-res.dto';
import { CacheService } from '../../core/cache/cache.service';
import { UserRole } from '@prisma/client';
import { createHash } from 'node:crypto';
import { UserRepository } from '../../user/user.repository';

interface TokenPayload {
  sub: string;
  role: UserRole;
}

interface RefreshTokenData {
  tokenHash: string;
  createdAt: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly cache: CacheService,
    private readonly userRepository: UserRepository,
  ) {}

  generateAccessToken(actor: AuthenticatedUser): string {
    return this.createToken(
      actor,
      this.config.get('ACCESS_TOKEN_EXPIRED'),
      this.config.get('JWT_ACCESS_SECRET'),
    );
  }

  async generateRefreshToken(
    actor: AuthenticatedUser,
    deviceId: string,
  ): Promise<string> {
    const duration = this.config.get('REFRESH_TOKEN_EXPIRED');

    await this.userRepository.createUserDevice(actor.id, deviceId);

    const token = this.createToken(
      actor,
      duration,
      this.config.get('JWT_REFRESH_SECRET'),
    );

    const ttlSeconds = ms(duration as StringValue) / 1000;
    const cacheKey = `refresh_token:${actor.id}:${deviceId}`;
    const tokenHash = this.hashToken(token);

    const data: RefreshTokenData = {
      tokenHash,
      createdAt: Date.now(),
    };

    await this.cache.set(cacheKey, JSON.stringify(data), ttlSeconds);

    return token;
  }

  async generateBothTokens(
    user: AuthenticatedUser,
    deviceId: string,
  ): Promise<TokensResDto> {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user, deviceId),
    };
  }

  private createToken(
    actor: AuthenticatedUser,
    expiresIn: string,
    secret: string,
  ): string {
    const payload: TokenPayload = { sub: actor.id, role: actor.role };

    const seconds = ms(expiresIn as StringValue) / 1000;

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: seconds,
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
