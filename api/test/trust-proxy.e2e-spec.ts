import { Controller, Get, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Throttle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { createFastifyAdapter } from './../src/config/fastify-adapter';

@Controller('throttled')
@UseGuards(ThrottlerGuard)
class ThrottledController {
  @Get()
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  hit() {
    return { ok: true };
  }
}

async function createApp(
  trustProxy: string | undefined,
): Promise<NestFastifyApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }])],
    controllers: [ThrottledController],
  }).compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(
    createFastifyAdapter({ TRUST_PROXY: trustProxy }),
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

function hit(app: NestFastifyApplication, forwardedFor: string) {
  return request(app.getHttpServer())
    .get('/throttled')
    .set('X-Forwarded-For', forwardedFor);
}

describe('Throttling behind a reverse proxy (e2e)', () => {
  describe('with TRUST_PROXY set to the proxy address', () => {
    let app: NestFastifyApplication;

    beforeAll(async () => {
      // supertest connects over loopback, so the test client plays the proxy.
      app = await createApp('loopback');
    });

    afterAll(async () => {
      await app.close();
    });

    it('keeps independent counters per X-Forwarded-For client', async () => {
      await hit(app, '203.0.113.1').expect(200);
      await hit(app, '203.0.113.1').expect(429);

      await hit(app, '203.0.113.2').expect(200);
      await hit(app, '203.0.113.2').expect(429);
    });
  });

  describe('without TRUST_PROXY', () => {
    let app: NestFastifyApplication;

    beforeAll(async () => {
      app = await createApp(undefined);
    });

    afterAll(async () => {
      await app.close();
    });

    it('ignores X-Forwarded-For and shares the counter of the peer address', async () => {
      await hit(app, '203.0.113.1').expect(200);
      await hit(app, '203.0.113.2').expect(429);
    });
  });
});
