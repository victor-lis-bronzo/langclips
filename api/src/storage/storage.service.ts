import { Injectable, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  GetObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const MAX_STORAGE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB in bytes
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB in bytes

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

      const response: ListObjectsV2CommandOutput =
        await this.client.send(command);
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
    fileSize?: number,
  ): Promise<{ uploadUrl: string; fileKey: string }> {
    if (fileSize !== undefined && fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size (${(fileSize / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed limit of 100MB.`,
      );
    }

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

  async generateDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME,
      Key: fileKey,
    });

    const downloadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 300,
    });

    return downloadUrl;
  }

  async deleteMany(fileKeys: string[]) {
    const command = new DeleteObjectsCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME,
      Delete: {
        Objects: fileKeys.map((key) => ({ Key: key })),
      },
    });

    await this.client.send(command);
  }

  async getObjectMetadata(
    fileKey: string,
  ): Promise<{ size: number; contentType?: string } | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: process.env.STORAGE_BUCKET_NAME,
        Key: fileKey,
      });

      const response = await this.client.send(command);
      return {
        size: response.ContentLength ?? 0,
        contentType: response.ContentType,
      };
    } catch (err: any) {
      if (
        err?.name === 'NotFound' ||
        err?.$metadata?.httpStatusCode === 404 ||
        err?.name === 'NoSuchKey'
      ) {
        return null;
      }
      throw err;
    }
  }
}
