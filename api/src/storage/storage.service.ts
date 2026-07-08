import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  client: S3Client;
  constructor(injectedClient: S3Client) {
    this.client = injectedClient;
  }

  async generatePresignedUrl(
    fileName: string,
    fileType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: 300,
    });
  }
}
