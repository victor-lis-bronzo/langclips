import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { StorageService } from '../storage/storage.service';

describe('UploadsController', () => {
  let controller: UploadsController;
  let service: StorageService;

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
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call generatePresignedUrl on storageService', async () => {
    const mockUrl = 'https://s3.amazonaws.com/bucket/file.mp4';
    jest.spyOn(service, 'generatePresignedUrl').mockResolvedValue(mockUrl);

    const dto = {
      filename: 'video.mp4',
      contentType: 'video/mp4',
    };

    const result = await controller.generatePresignedUrl(dto);

    expect(result).toEqual({ uploadUrl: mockUrl });
    expect(service.generatePresignedUrl).toHaveBeenCalledWith('video.mp4', 'video/mp4');
  });
});
