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
import { StorageService } from '../storage/storage.service';
import { AcknowledgeDownloadDto } from './dtos/acknowledge-download.dto';

@Controller('videos')
export class VideosController {
  constructor(
    @InjectQueue('video-processing') private readonly videoQueue: Queue,
    private readonly storageService: StorageService,
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

  @Post('acknowledge-download')
  @HttpCode(HttpStatus.OK)
  async acknowledgeDownload(@Body() body: AcknowledgeDownloadDto) {
    await this.storageService.deleteMany(body.fileKeys);
    return { acknowledged: true, deletedCount: body.fileKeys.length };
  }

  @Get('events/:jobId')
  @Sse()
  events(@Param('jobId') jobId: string): Observable<MessageEvent> {
    return this.videoEventsService.getJobStream(jobId);
  }
}
