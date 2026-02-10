import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../../core/config/config.service';
import { TokensResDto } from '../dto/response/tokens-res.dto';
import { CacheService } from '../../core/cache/cache.service';
import { UserRole } from '@prisma/client';
import { createHash } from 'node:crypto';
import { UserRepository } from '../../user/user.repository';

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly cache: CacheService,
    private readonly userRepository: UserRepository,
  ) {}

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('ACCESS_TOKEN_EXPIRED'),
    });
  }

  async generateBothTokens(
    payload: TokenPayload,
    deviceId: string,
  ): Promise<TokensResDto> {
    const accessToken = await this.generateAccessToken(payload);

    const refreshToken = await this.createAndSaveRefreshToken(
      payload,
      deviceId,
    );

    return { accessToken, refreshToken };
  }

  async getAccessPayload(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
      });
    } catch (error) {
      this.logger.warn('Invalid access token', error);
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private async createAndSaveRefreshToken(
    payload: TokenPayload,
    deviceId: string,
  ): Promise<string> {
    const expiresIn = this.config.get('REFRESH_TOKEN_EXPIRED');

    await this.userRepository.createUserDevice(payload.sub, deviceId);

    const token = await this.jwtService.signAsync(payload, {
      expiresIn,
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });

    const tokenKey = this.buildTokenKey(payload.sub, deviceId);
    const tokenHash = this.hashToken(token);

    const pipeline = this.cache.pipeline();

    pipeline.setEx(tokenKey, expiresIn, tokenHash);

    pipeline.zAdd(this.buildDeviceIndexKey(payload.sub), Date.now(), deviceId);
    pipeline.expire(this.buildDeviceIndexKey(payload.sub), expiresIn + 60);

    await pipeline.exec();

    return token;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildTokenKey(userId: string, deviceId: string): string {
    return `refresh:${userId}:${deviceId}`;
  }

  private buildDeviceIndexKey(userId: string) {
    return `refresh:devices:${userId}`;
  }
}
