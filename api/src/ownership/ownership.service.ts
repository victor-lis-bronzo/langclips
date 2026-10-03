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
    return owner === sessionId;
  }

  async areAllOwners(fileKeys: string[], sessionId: string): Promise<boolean> {
    if (!fileKeys.length) return true;
    const pipeline = this.redis.pipeline();
    for (const fileKey of fileKeys) {
      pipeline.get(this.getRedisKey(fileKey));
    }
    const results = await pipeline.exec();
    if (!results) return false;

    for (const [err, owner] of results) {
      if (err || owner !== sessionId) {
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
