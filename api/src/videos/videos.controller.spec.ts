import { Test, TestingModule } from '@nestjs/testing';
import { VideosController } from './videos.controller';
import { VideoEventsService } from './video-events.service';
import { StorageService } from '../storage/storage.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('VideosController', () => {
  let controller: VideosController;
  let moduleRef: TestingModule;
  let mockQueue: any;
  let mockStorageService: any;

  beforeEach(async () => {
    mockQueue = { add: jest.fn() };
    mockStorageService = { deleteMany: jest.fn() };

    moduleRef = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [
        {
          provide: getQueueToken('video-processing'),
          useValue: mockQueue,
        },
        {
          provide: VideoEventsService,
          useValue: {
            getJobStream: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    controller = moduleRef.get<VideosController>(VideosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should process video request and queue job', async () => {
    mockQueue.add.mockResolvedValue({ id: 'job-123' });

    const result = await controller.process({ fileKey: 'uploads/test.mp4' });

    expect(result).toEqual({
      message: 'Upload acknowledged and job queued.',
      jobId: 'job-123',
    });
    expect(mockQueue.add).toHaveBeenCalledWith(
      'extract-audio-and-transcribe',
      { fileKey: 'uploads/test.mp4' },
      expect.objectContaining({ jobId: expect.any(String) }),
    );
  });

  it('should acknowledge download and delete files from storage', async () => {
    mockStorageService.deleteMany.mockResolvedValue(undefined);

    const result = await controller.acknowledgeDownload({
      fileKeys: ['key1.mp4', 'key2.mp3'],
    });

    expect(result).toEqual({
      acknowledged: true,
      deletedCount: 2,
    });
    expect(mockStorageService.deleteMany).toHaveBeenCalledWith([
      'key1.mp4',
      'key2.mp3',
    ]);
  });
});
