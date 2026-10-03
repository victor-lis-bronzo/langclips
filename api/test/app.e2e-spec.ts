process.env.STORAGE_ENDPOINT =
  process.env.STORAGE_ENDPOINT || 'https://dummy.r2.cloudflarestorage.com';
process.env.STORAGE_REGION = process.env.STORAGE_REGION || 'auto';
process.env.STORAGE_ACCESS_KEY_ID =
  process.env.STORAGE_ACCESS_KEY_ID || 'dummy';
process.env.STORAGE_SECRET_ACCESS_KEY =
  process.env.STORAGE_SECRET_ACCESS_KEY || 'dummy';
process.env.STORAGE_BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || 'dummy';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;
  let queue: Queue;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    try {
      queue = moduleFixture.get<Queue>(getQueueToken('video-processing'));
    } catch {
      // queue not resolved or not initialized
    }

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (queue) {
      await queue.close();
    }
    if (app) {
      await app.close();
    }
  });

  it('/uploads/generate-presigned-url (POST) - validation error on empty body', () => {
    return request(app.getHttpServer())
      .post('/uploads/generate-presigned-url')
      .send({})
      .expect(400);
  });
});
