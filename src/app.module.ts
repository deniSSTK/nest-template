import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [CoreModule, AuthModule, UserModule, UtilsModule],
})
export class AppModule {}
