import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

@Module({
  providers: [UserService, UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
