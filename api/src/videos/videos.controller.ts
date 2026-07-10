import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ProcessVideoDto } from './dtos/process-video.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('videos')
export class VideosController {
  constructor(
    @InjectQueue('video-processing') private readonly videoQueue: Queue,
  ) {}

  @Post('process')
  @HttpCode(HttpStatus.ACCEPTED)
  async process(@Body() body: ProcessVideoDto) {
    const job = await this.videoQueue.add('extract-audio-and-transcribe', {
      fileKey: body.fileKey,
    });

    return {
      message: 'Upload acknowledged and job queued.',
      jobId: job.id,
    };
  }
}
