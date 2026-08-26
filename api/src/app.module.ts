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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD || undefined,
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
  ],
})
export class AppModule {}
