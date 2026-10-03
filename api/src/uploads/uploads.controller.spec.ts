import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { StorageService } from '../storage/storage.service';
import { OwnershipService } from '../ownership/ownership.service';
import { SessionGuard } from '../auth/session.guard';
import { SessionService } from '../auth/session.service';

describe('UploadsController', () => {
  let controller: UploadsController;
  let service: StorageService;
  let ownershipService: OwnershipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: StorageService,
          useValue: {
            generatePresignedUrl: jest.fn(),
          },
        },
        {
          provide: OwnershipService,
          useValue: {
            setOwner: jest.fn(),
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

    controller = module.get<UploadsController>(UploadsController);
    service = module.get<StorageService>(StorageService);
    ownershipService = module.get<OwnershipService>(OwnershipService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call generatePresignedUrl and record ownership', async () => {
    const mockUrl = 'https://s3.amazonaws.com/bucket/file.mp4';
    jest.spyOn(service, 'generatePresignedUrl').mockResolvedValue({
      uploadUrl: mockUrl,
      fileKey: 'videos/uuid-video.mp4',
    });

    const dto = {
      filename: 'video.mp4',
      contentType: 'video/mp4',
    };

    const session = { id: 'session-abc' };
    const result = await controller.generatePresignedUrl(dto, session);

    expect(result).toEqual({
      uploadUrl: mockUrl,
      fileKey: 'videos/uuid-video.mp4',
    });
    expect(service.generatePresignedUrl).toHaveBeenCalledWith(
      'video.mp4',
      'video/mp4',
    );
    expect(ownershipService.setOwner).toHaveBeenCalledWith(
      'videos/uuid-video.mp4',
      'session-abc',
    );
  });
});
