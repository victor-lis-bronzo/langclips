import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { OwnershipService } from '../ownership/ownership.service';
import { SessionGuard } from '../auth/session.guard';
import { SessionService } from '../auth/session.service';

describe('StorageController', () => {
  let controller: StorageController;
  let storageService: StorageService;
  let ownershipService: OwnershipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: {
            generateDownloadUrl: jest.fn(),
          },
        },
        {
          provide: OwnershipService,
          useValue: {
            isOwner: jest.fn(),
          },
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
    }).compile();

    controller = module.get<StorageController>(StorageController);
    storageService = module.get<StorageService>(StorageService);
    ownershipService = module.get<OwnershipService>(OwnershipService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return downloadUrl when caller is the owner', async () => {
    jest.spyOn(ownershipService, 'isOwner').mockResolvedValue(true);
    jest
      .spyOn(storageService, 'generateDownloadUrl')
      .mockResolvedValue('https://download-url.test');

    const result = await controller.getDownloadUrl('videos/my-video.mp4', {
      id: 'session-123',
    });

    expect(result).toEqual({ downloadUrl: 'https://download-url.test' });
    expect(ownershipService.isOwner).toHaveBeenCalledWith(
      'videos/my-video.mp4',
      'session-123',
    );
  });

  it('should throw ForbiddenException when caller is not the owner (IDOR protection)', async () => {
    jest.spyOn(ownershipService, 'isOwner').mockResolvedValue(false);

    await expect(
      controller.getDownloadUrl('videos/victim-video.mp4', {
        id: 'attacker-session',
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(storageService.generateDownloadUrl).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when fileKey is missing', async () => {
    await expect(
      controller.getDownloadUrl('', { id: 'session-123' }),
    ).rejects.toThrow(BadRequestException);
  });
});
