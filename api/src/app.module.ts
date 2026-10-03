import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { StorageModule } from './storage/storage.module';
import { UploadsModule } from './uploads/uploads.module';
import { VideosModule } from './videos/videos.module';
import { HealthModule } from './health/health.module';
import { FastifyAdapter } from '@bull-board/fastify';
import { validate } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { OwnershipModule } from './ownership/ownership.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD || undefined,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 50,
        removeOnFail: 50,
      },
    }),
    ...(process.env.ENABLE_BULL_BOARD === 'true'
      ? [
          BullBoardModule.forRoot({
            route: '/admin/queues',
            adapter: FastifyAdapter,
          }),
        ]
      : []),
    StorageModule,
    UploadsModule,
    VideosModule,
    HealthModule,
    AuthModule,
    OwnershipModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),
  ],
})
export class AppModule {}
