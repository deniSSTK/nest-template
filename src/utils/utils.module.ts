import { Global, Module } from '@nestjs/common';
import { TimeModule } from './time/time.module';

@Global()
@Module({
  imports: [TimeModule],
  exports: [TimeModule],
})
export class UtilsModule {}
