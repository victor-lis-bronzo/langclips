import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { IStorageService } from "../interfaces/storage.interface";

export class R2StorageService implements IStorageService {
  constructor(
    private readonly client: S3Client,
    private readonly bucketName: string,
  ) {}

  async download({
    fileKey,
    destinationPath,
  }: {
    fileKey: string;
    destinationPath: string;
  }) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });
    const response = await this.client.send(command);
    const body = response.Body as Readable;
    await pipeline(body, createWriteStream(destinationPath));
    return {
      success: true,
      downloadedFilePath: destinationPath,
    };
  }

  async upload({
    fileKey,
    body,
    contentType,
  }: {
    fileKey: string;
    body: Buffer | string;
    contentType: string;
  }) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: body,
      ContentType: contentType,
    });
    await this.client.send(command);
    return {
      success: true,
    };
  }

  async delete({ fileKey }: { fileKey: string }) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });
    await this.client.send(command);
    return {
      success: true,
    };
  }
}
