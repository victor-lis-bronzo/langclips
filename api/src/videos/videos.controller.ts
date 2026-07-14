import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  BadRequestException,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ProcessVideoDto } from './dtos/process-video.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { VideoEventsService } from './video-events.service';

@Controller('videos')
export class VideosController {
  constructor(
    @InjectQueue('video-processing') private readonly videoQueue: Queue,
    private readonly videoEventsService: VideoEventsService,
  ) {}

  @Post('process')
  @HttpCode(HttpStatus.ACCEPTED)
  async process(@Body() body: ProcessVideoDto) {
    const job = await this.videoQueue.add(
      'extract-audio-and-transcribe',
      {
        fileKey: body.fileKey,
      },
      {
        jobId: randomUUID(),
      },
    );

    return {
      message: 'Upload acknowledged and job queued.',
      jobId: job.id,
    };
  }

  @Get('events/:jobId')
  @Sse()
  events(@Param('jobId') jobId: string): Observable<MessageEvent> {
    return this.videoEventsService.getJobStream(jobId);
  }
}
