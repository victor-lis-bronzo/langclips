import { Test, TestingModule } from '@nestjs/testing';
import { VideoEventsService } from './video-events.service';
import { getQueueToken } from '@nestjs/bullmq';
import { EventEmitter } from 'events';

const mockQueueEventsInstance = Object.assign(new EventEmitter(), {
  close: jest.fn().mockResolvedValue(undefined),
});

jest.mock('bullmq', () => {
  const actual = jest.requireActual('bullmq');
  return {
    ...actual,
    QueueEvents: jest.fn().mockImplementation(() => mockQueueEventsInstance),
  };
});

describe('VideoEventsService', () => {
  let service: VideoEventsService;
  let mockQueue: any;

  beforeEach(async () => {
    mockQueueEventsInstance.removeAllListeners();
    mockQueueEventsInstance.close.mockClear();

    mockQueue = {
      opts: { connection: {} },
      getJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoEventsService,
        {
          provide: getQueueToken('video-processing'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<VideoEventsService>(VideoEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should clean up event listeners on unsubscribe to prevent memory leaks', (done) => {
    const mockJob = {
      getState: jest.fn().mockResolvedValue('active'),
      progress: 25,
    };
    mockQueue.getJob.mockResolvedValue(mockJob);

    const subscription = service.getJobStream('test-job-id').subscribe({
      next: (event) => {
        expect(event.data).toEqual({ status: 'processing', progress: 25 });
      },
    });

    // Verify listeners are attached
    expect(mockQueueEventsInstance.listenerCount('progress')).toBe(1);
    expect(mockQueueEventsInstance.listenerCount('completed')).toBe(1);
    expect(mockQueueEventsInstance.listenerCount('failed')).toBe(1);

    // Trigger unsubscribe (client disconnection)
    subscription.unsubscribe();

    // Verify listeners are detached (memory leak prevention)
    expect(mockQueueEventsInstance.listenerCount('progress')).toBe(0);
    expect(mockQueueEventsInstance.listenerCount('completed')).toBe(0);
    expect(mockQueueEventsInstance.listenerCount('failed')).toBe(0);

    done();
  });
});
