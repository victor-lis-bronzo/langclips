import { Global, Module } from '@nestjs/common';
import { OwnershipService } from './ownership.service';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [OwnershipService],
  exports: [OwnershipService],
})
export class OwnershipModule {}
