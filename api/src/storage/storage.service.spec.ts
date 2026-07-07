import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mocked-url.com'),
}));

describe('StorageService', () => {
  let service: StorageService;
  let client: S3Client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: S3Client,
          useValue: new S3Client({ region: 'us-east-1' }),
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    client = module.get<S3Client>(S3Client);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a presigned URL', async () => {
    process.env.AWS_BUCKET_NAME = 'my-bucket';
    const url = await service.generatePresignedUrl('video.mp4', 'video/mp4');

    expect(url).toBe('https://mocked-url.com');
    expect(getSignedUrl).toHaveBeenCalledWith(
      client,
      expect.any(PutObjectCommand),
      { expiresIn: 300 }
    );
  });
});
