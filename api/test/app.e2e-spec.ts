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
