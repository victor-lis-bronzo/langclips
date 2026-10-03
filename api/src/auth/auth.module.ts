import { Global, Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionGuard } from './session.guard';

@Global()
@Module({
  providers: [SessionService, SessionGuard],
  exports: [SessionService, SessionGuard],
})
export class AuthModule {}
