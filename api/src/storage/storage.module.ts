import { Module, DynamicModule } from '@nestjs/common';
import { StorageService } from './storage.service';
import { S3Client } from '@aws-sdk/client-s3';

@Module({})
export class StorageModule {
  static register(s3Client: S3Client): DynamicModule {
    return {
      module: StorageModule,
      global: true,
      providers: [
        {
          provide: S3Client,
          useValue: s3Client,
        },
        StorageService,
      ],
      exports: [StorageService, S3Client],
    };
  }
}
