import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class OwnershipService {
  private readonly defaultTtlSeconds = 86400; // 24 hours

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private getRedisKey(fileKey: string): string {
    return `owner:${fileKey}`;
  }

  async setOwner(
    fileKey: string,
    sessionId: string,
    ttlSeconds: number = this.defaultTtlSeconds,
  ): Promise<void> {
    await this.redis.set(
      this.getRedisKey(fileKey),
      sessionId,
      'EX',
      ttlSeconds,
    );
  }

  async setJobOwner(
    jobId: string,
    sessionId: string,
    ttlSeconds: number = this.defaultTtlSeconds,
  ): Promise<void> {
    await this.redis.set(`owner:job:${jobId}`, sessionId, 'EX', ttlSeconds);
    await this.setOwner(`decks/${jobId}.json`, sessionId, ttlSeconds);
  }

  async setOwnerMany(
    fileKeys: string[],
    sessionId: string,
    ttlSeconds: number = this.defaultTtlSeconds,
  ): Promise<void> {
    if (!fileKeys.length) return;
    const pipeline = this.redis.pipeline();
    for (const fileKey of fileKeys) {
      pipeline.set(this.getRedisKey(fileKey), sessionId, 'EX', ttlSeconds);
    }
    await pipeline.exec();
  }

  async getOwner(fileKey: string): Promise<string | null> {
    return this.redis.get(this.getRedisKey(fileKey));
  }

  async isOwner(fileKey: string, sessionId: string): Promise<boolean> {
    const owner = await this.getOwner(fileKey);
    if (owner === sessionId) {
      return true;
    }

    const clipsMatch = fileKey.match(/^clips\/([a-zA-Z0-9-]+)\//);
    if (clipsMatch) {
      const jobId = clipsMatch[1];
      const jobOwner = await this.redis.get(`owner:job:${jobId}`);
      if (jobOwner === sessionId) {
        return true;
      }
    }

    const decksMatch = fileKey.match(/^decks\/([a-zA-Z0-9-]+)\.json$/);
    if (decksMatch) {
      const jobId = decksMatch[1];
      const jobOwner = await this.redis.get(`owner:job:${jobId}`);
      if (jobOwner === sessionId) {
        return true;
      }
    }

    return false;
  }

  async areAllOwners(fileKeys: string[], sessionId: string): Promise<boolean> {
    if (!fileKeys.length) return true;
    for (const fileKey of fileKeys) {
      const owns = await this.isOwner(fileKey, sessionId);
      if (!owns) {
        return false;
      }
    }
    return true;
  }

  async deleteOwnership(fileKey: string): Promise<void> {
    await this.redis.del(this.getRedisKey(fileKey));
  }

  async deleteOwnershipMany(fileKeys: string[]): Promise<void> {
    if (!fileKeys.length) return;
    const keys = fileKeys.map((k) => this.getRedisKey(k));
    await this.redis.del(...keys);
  }
}
