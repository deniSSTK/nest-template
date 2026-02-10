import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { AccountReqDto } from './dto/request/account-req.dto';
import * as bcrypt from 'bcrypt';
import { AuthResDto } from './dto/response/auth-res.dto';
import { TokenPayload, TokenService } from './token/token.service';
import { TokensResDto } from './dto/response/tokens-res.dto';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: AccountReqDto): Promise<AuthResDto> {
    this.logger.log('Register new user account', { email: dto.email });

    const emailExists = await this.authRepository.IsEmailExists(dto.email);
    if (emailExists) {
      this.logger.warn(`Email already exists for ${dto.email}`);
      throw new ConflictException('Email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.authRepository.createUser({
      ...dto,
      password: hashedPassword,
    });

    const payload: TokenPayload = { sub: user.id, role: user.role };

    const tokens = await this.saveDeviceAndRefreshToken(payload, dto.deviceId);

    this.logger.log('Account registered successfully', {
      email: dto.email,
      userId: user.id,
    });

    return {
      tokens,
      user,
    };
  }

  async login(dto: AccountReqDto): Promise<AuthResDto> {
    this.logger.log('Attempt to login user', { email: dto.email });

    const passwordHash = await this.authRepository.getPasswordByEmail(
      dto.email,
    );

    if (!passwordHash) {
      this.logger.warn('Password not found', { email: dto.email });
      throw new ConflictException('User does not exist');
    }

    const match = await bcrypt.compare(passwordHash, dto.password);
    if (!match) {
      this.logger.warn('Password incorrect', { email: dto.email });
      throw new UnauthorizedException('Password incorrect');
    }

    const user = await this.authRepository.getAuthUserByEmail(dto.email);

    if (!user) {
      this.logger.warn('User data not found', { email: dto.email });
      throw new UnauthorizedException('User data not found');
    }

    const payload: TokenPayload = { sub: user.id, role: user.role };
    const tokens = await this.saveDeviceAndRefreshToken(payload, dto.deviceId);

    this.logger.log('User login successfully ', { userId: user.id });

    return {
      tokens,
      user,
    };
  }

  private async saveDeviceAndRefreshToken(
    payload: TokenPayload,
    deviceId: string,
  ): Promise<TokensResDto> {
    await this.userRepository.saveUserDevice(payload.sub, deviceId);

    return this.tokenService.generateBothTokens(payload, deviceId);
  }
}
