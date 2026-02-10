import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { TokenModule } from './token/token.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TokenModule, UserModule],
  providers: [AuthService, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
