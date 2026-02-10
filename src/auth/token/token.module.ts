import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { UserModule } from '../../user/user.module';
import { TokenGuard } from './token.guard';

@Global()
@Module({
  imports: [JwtModule.register({}), UserModule],
  providers: [TokenService, TokenGuard],
  exports: [TokenService, TokenGuard],
})
export class TokenModule {}
