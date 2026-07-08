import { Module, DynamicModule, Global } from '@nestjs/common';
import { StorageService } from './storage.service';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const accessKeyId = configService.get<string>('STORAGE_ACCESS_KEY_ID');
        const secretAccessKey = configService.get<string>(
          'STORAGE_SECRET_ACCESS_KEY',
        );

        const credentials =
          accessKeyId && secretAccessKey
            ? { accessKeyId, secretAccessKey }
            : undefined;

        return new S3Client({
          endpoint: configService.get<string>('STORAGE_ENDPOINT'),
          region: configService.get<string>('STORAGE_REGION'),
          credentials,
          forcePathStyle:
            configService.get<string>('STORAGE_FORCE_PATH_STYLE') === 'true',
        });
      },
    },
    StorageService,
  ],
  exports: [StorageService, S3Client],
})
export class StorageModule {}
