import {
  Injectable,
  OnModuleDestroy,
  BadRequestException,
  MessageEvent,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';
import { Observable } from 'rxjs';

@Injectable()
export class VideoEventsService implements OnModuleDestroy {
  private readonly queueEvents: QueueEvents;

  constructor(
    @InjectQueue('video-processing') private readonly videoQueue: Queue,
  ) {
    this.queueEvents = new QueueEvents('video-processing', {
      connection: this.videoQueue.opts.connection,
    });
  }

  async onModuleDestroy() {
    await this.queueEvents.close();
  }

  getJobStream(jobId: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      this.videoQueue.getJob(jobId).then((job) => {
        if (!job) {
          subscriber.error(new BadRequestException('Job não encontrado.'));
          return;
        }

        job.getState().then((state) => {
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
          } else {
            if (job.progress) {
              subscriber.next({
                data: {
                  status: 'processing',
                  progress: job.progress,
                },
              });
            }
          }
        });
      });

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
          subscriber.complete();
        }
      };

      const onFailed = ({ jobId: eventJobId, failedReason }) => {
        if (eventJobId === jobId) {
          subscriber.next({ data: { status: 'failed', error: failedReason } });
          subscriber.complete();
        }
      };

      this.queueEvents.on('progress', onProgress);
      this.queueEvents.on('completed', onCompleted);
      this.queueEvents.on('failed', onFailed);

      return () => {
        this.queueEvents.off('progress', onProgress);
        this.queueEvents.off('completed', onCompleted);
        this.queueEvents.off('failed', onFailed);
      };
    });
  }
}
