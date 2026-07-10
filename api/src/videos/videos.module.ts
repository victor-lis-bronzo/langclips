import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'video-processing',
    }),
    BullBoardModule.forFeature({
      name: 'video-processing',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [VideosController],
})
export class VideosModule {}
