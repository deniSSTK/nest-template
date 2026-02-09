import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [JwtModule.register({}), UserModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
