import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  Sse,
  MessageEvent,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ProcessVideoDto } from './dtos/process-video.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { VideoEventsService } from './video-events.service';
import { StorageService } from '../storage/storage.service';
import { AcknowledgeDownloadDto } from './dtos/acknowledge-download.dto';
import { OwnershipService } from '../ownership/ownership.service';
import { SessionGuard, AnonymousSession } from '../auth/session.guard';
import { CurrentSession } from '../auth/current-session.decorator';

@Controller('videos')
@UseGuards(SessionGuard)
export class VideosController {
  constructor(
    @InjectQueue('video-processing') private readonly videoQueue: Queue,
    private readonly storageService: StorageService,
    private readonly videoEventsService: VideoEventsService,
    private readonly ownershipService: OwnershipService,
  ) {}

  @Post('process')
  @HttpCode(HttpStatus.ACCEPTED)
  async process(
    @Body() body: ProcessVideoDto,
    @CurrentSession() session: AnonymousSession,
  ) {
    const isOwner = await this.ownershipService.isOwner(
      body.fileKey,
      session.id,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'Acesso negado: o arquivo de vídeo informado não pertence à sua sessão.',
      );
    }

    const jobId = randomUUID();
    await this.ownershipService.setJobOwner(jobId, session.id);

    const job = await this.videoQueue.add(
      'extract-audio-and-transcribe',
      {
        fileKey: body.fileKey,
        sessionId: session.id,
      },
      {
        jobId,
      },
    );

    return {
      message: 'Upload acknowledged and job queued.',
      jobId: job.id,
    };
  }

  @Post('acknowledge-download')
  @HttpCode(HttpStatus.OK)
  async acknowledgeDownload(
    @Body() body: AcknowledgeDownloadDto,
    @CurrentSession() session: AnonymousSession,
  ) {
    const isAuthorized = await this.ownershipService.areAllOwners(
      body.fileKeys,
      session.id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException(
        'Acesso negado: tentativa não autorizada de excluir arquivos que não pertencem à sua sessão.',
      );
    }

    await this.storageService.deleteMany(body.fileKeys);
    await this.ownershipService.deleteOwnershipMany(body.fileKeys);

    return { acknowledged: true, deletedCount: body.fileKeys.length };
  }

  @Get('events/:jobId')
  @Sse()
  events(@Param('jobId') jobId: string): Observable<MessageEvent> {
    return this.videoEventsService.getJobStream(jobId);
  }
}
