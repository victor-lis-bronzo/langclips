import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideoEventsService } from './video-events.service';
import { StorageService } from '../storage/storage.service';
import { OwnershipService } from '../ownership/ownership.service';
import { SessionGuard } from '../auth/session.guard';
import { SessionService } from '../auth/session.service';
import { getQueueToken } from '@nestjs/bullmq';

import { ThrottlerGuard } from '@nestjs/throttler';

describe('VideosController', () => {
  let controller: VideosController;
  let moduleRef: TestingModule;
  let mockQueue: any;
  let mockStorageService: any;
  let mockOwnershipService: any;

  beforeEach(async () => {
    mockQueue = { add: jest.fn() };
    mockStorageService = {
      deleteMany: jest.fn(),
      getObjectMetadata: jest.fn().mockResolvedValue({
        size: 5000000,
        contentType: 'video/mp4',
      }),
    };
    mockOwnershipService = {
      isOwner: jest.fn().mockResolvedValue(true),
      areAllOwners: jest.fn().mockResolvedValue(true),
      setJobOwner: jest.fn().mockResolvedValue(undefined),
      deleteOwnershipMany: jest.fn().mockResolvedValue(undefined),
    };

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
        {
          provide: OwnershipService,
          useValue: mockOwnershipService,
        },
        {
          provide: SessionService,
          useValue: {
            verifyToken: jest.fn(),
            createSession: jest.fn().mockReturnValue({
              sessionId: 'session-123',
              token: 'test.token',
            }),
          },
        },
        SessionGuard,
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SessionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get<VideosController>(VideosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should process video request, register job ownership and queue job', async () => {
    mockQueue.add.mockResolvedValue({ id: 'job-123' });

    const session = { id: 'session-123' };
    const result = await controller.process(
      { fileKey: 'uploads/test.mp4' },
      session,
    );

    expect(result).toEqual({
      message: 'Upload acknowledged and job queued.',
      jobId: 'job-123',
    });
    expect(mockOwnershipService.isOwner).toHaveBeenCalledWith(
      'uploads/test.mp4',
      'session-123',
    );
    expect(mockOwnershipService.setJobOwner).toHaveBeenCalled();
    expect(mockQueue.add).toHaveBeenCalledWith(
      'extract-audio-and-transcribe',
      { fileKey: 'uploads/test.mp4', sessionId: 'session-123' },
      expect.objectContaining({ jobId: expect.any(String) }),
    );
  });

  it('should reject process if fileKey does not belong to session', async () => {
    mockOwnershipService.isOwner.mockResolvedValueOnce(false);

    const session = { id: 'attacker-session' };
    await expect(
      controller.process({ fileKey: 'uploads/victim.mp4' }, session),
    ).rejects.toThrow(ForbiddenException);

    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it('should reject process if fileKey does not exist in storage', async () => {
    mockStorageService.getObjectMetadata.mockResolvedValueOnce(null);

    const session = { id: 'session-123' };
    await expect(
      controller.process({ fileKey: 'uploads/deleted.mp4' }, session),
    ).rejects.toThrow(NotFoundException);

    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it('should acknowledge download and delete files when caller is owner of all keys', async () => {
    mockStorageService.deleteMany.mockResolvedValue(undefined);

    const session = { id: 'session-123' };
    const result = await controller.acknowledgeDownload(
      { fileKeys: ['key1.mp4', 'key2.mp3'] },
      session,
    );

    expect(result).toEqual({
      acknowledged: true,
      deletedCount: 2,
    });
    expect(mockOwnershipService.areAllOwners).toHaveBeenCalledWith(
      ['key1.mp4', 'key2.mp3'],
      'session-123',
    );
    expect(mockStorageService.deleteMany).toHaveBeenCalledWith([
      'key1.mp4',
      'key2.mp3',
    ]);
    expect(mockOwnershipService.deleteOwnershipMany).toHaveBeenCalledWith([
      'key1.mp4',
      'key2.mp3',
    ]);
  });

  it('should throw ForbiddenException in acknowledgeDownload if any key belongs to another session', async () => {
    mockOwnershipService.areAllOwners.mockResolvedValueOnce(false);

    const session = { id: 'attacker-session' };
    await expect(
      controller.acknowledgeDownload(
        { fileKeys: ['my-key.mp4', 'victim-key.mp4'] },
        session,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(mockStorageService.deleteMany).not.toHaveBeenCalled();
  });
});
