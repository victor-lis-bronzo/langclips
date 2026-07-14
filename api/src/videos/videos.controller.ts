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
import { Queue, QueueEvents } from 'bullmq';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';

@Controller('videos')
export class VideosController {
  private readonly queueEvents: QueueEvents;

  constructor(
    @InjectQueue('video-processing') private readonly videoQueue: Queue,
  ) {
    this.queueEvents = new QueueEvents('video-processing', {
      connection: this.videoQueue.opts.connection,
    });
  }

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
  @HttpCode(HttpStatus.OK)
  @Sse()
  events(@Param('jobId') jobId: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      // 1. Validar se o job sequer existe ou se já acabou antes de escutar eventos
      this.videoQueue.getJob(jobId).then((job) => {
        if (!job) {
          subscriber.error(new BadRequestException('Job não encontrado.'));
          return;
        }

        job.getState().then((state) => {
          // Se o web client tentar conectar mas o worker já terminou o serviço rápido demais
          if (state === 'completed' || state === 'failed') {
            subscriber.next({
              data: {
                status: state,
                progress: 100,
                result: job.returnvalue,
                error: job.failedReason,
              },
            });
            subscriber.complete();
            return;
          }
        });
      });

      // 2. Handlers dos eventos do Redis
      const onProgress = ({ jobId: eventJobId, data }) => {
        if (eventJobId === jobId) {
          subscriber.next({ data: { status: 'processing', progress: data } });
        }
      };

      const onCompleted = ({ jobId: eventJobId, returnvalue }) => {
        if (eventJobId === jobId) {
          subscriber.next({
            data: { status: 'completed', result: returnvalue },
          });
          subscriber.complete(); // Encerra a conexão SSE com sucesso
        }
      };

      const onFailed = ({ jobId: eventJobId, failedReason }) => {
        if (eventJobId === jobId) {
          subscriber.next({ data: { status: 'failed', error: failedReason } });
          subscriber.complete(); // Encerra a conexão SSE informando falha
        }
      };

      // 3. Registra os ouvintes
      this.queueEvents.on('progress', onProgress);
      this.queueEvents.on('completed', onCompleted);
      this.queueEvents.on('failed', onFailed);

      // 4. CLEANUP
      return () => {
        this.queueEvents.off('progress', onProgress);
        this.queueEvents.off('completed', onCompleted);
        this.queueEvents.off('failed', onFailed);
      };
    });
  }
}
