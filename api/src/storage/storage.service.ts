import { Injectable, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const MAX_STORAGE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB in bytes

@Injectable()
export class StorageService {
  client: S3Client;
  constructor(injectedClient: S3Client) {
    this.client = injectedClient;
  }

  async calculateTotalStorageSize(): Promise<number> {
    const bucketName = process.env.STORAGE_BUCKET_NAME;
    let totalSize = 0;
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      });

      const response = (await this.client.send(
        command,
      )) as ListObjectsV2CommandOutput;
      if (response.Contents) {
        for (const object of response.Contents) {
          totalSize += object.Size || 0;
        }
      }

      isTruncated = response.IsTruncated || false;
      continuationToken = response.NextContinuationToken;
    }

    return totalSize;
  }

  async generatePresignedUrl(
    fileName: string,
    fileType: string,
  ): Promise<{ uploadUrl: string; fileKey: string }> {
    const totalSize = await this.calculateTotalStorageSize();
    if (totalSize >= MAX_STORAGE_SIZE) {
      throw new BadRequestException(
        'Limite de armazenamento de 5GB atingido. Novos uploads não são permitidos.',
      );
    }

    const formattedName = fileName
      .trim()
      .replaceAll(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    const fileKey = `videos/${randomUUID()}-${formattedName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 300,
    });

    return { uploadUrl, fileKey };
  }
}
