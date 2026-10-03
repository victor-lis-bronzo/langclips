import { Global, Module, OnModuleDestroy, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../ownership/ownership.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = Number(process.env.REDIS_PORT) || 6379;
        const password = process.env.REDIS_PASSWORD || undefined;

        return new Redis({
          host,
          port,
          password,
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 3,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleDestroy() {
    try {
      if (this.redis.status === 'ready' || this.redis.status === 'connecting') {
        await this.redis.quit();
      } else {
        this.redis.disconnect();
      }
    } catch {
      // Ignore disconnect errors during teardown
    }
  }
}
