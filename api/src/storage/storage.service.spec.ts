import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException } from '@nestjs/common';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mocked-url.com'),
}));

describe('StorageService', () => {
  let service: StorageService;
  let s3ClientMock: any;

  beforeEach(async () => {
    s3ClientMock = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: S3Client,
          useValue: s3ClientMock,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a presigned URL when storage size is below 5GB', async () => {
    process.env.STORAGE_BUCKET_NAME = 'my-bucket';

    // Total: 3GB (under 5GB)
    s3ClientMock.send.mockResolvedValueOnce({
      Contents: [
        { Size: 2 * 1024 * 1024 * 1024 },
        { Size: 1 * 1024 * 1024 * 1024 },
      ],
      IsTruncated: false,
    });

    const result = await service.generatePresignedUrl('video.mp4', 'video/mp4');

    expect(result.uploadUrl).toBe('https://mocked-url.com');
    expect(result.fileKey).toBeDefined();
    expect(getSignedUrl).toHaveBeenCalledWith(
      s3ClientMock,
      expect.any(PutObjectCommand),
      { expiresIn: 300 },
    );
  });

  it('should throw BadRequestException when storage size is 5GB or more', async () => {
    process.env.STORAGE_BUCKET_NAME = 'my-bucket';

    // Total: 5GB
    s3ClientMock.send.mockResolvedValueOnce({
      Contents: [
        { Size: 3 * 1024 * 1024 * 1024 },
        { Size: 2 * 1024 * 1024 * 1024 },
      ],
      IsTruncated: false,
    });

    await expect(
      service.generatePresignedUrl('video.mp4', 'video/mp4'),
    ).rejects.toThrow(BadRequestException);
  });
});
