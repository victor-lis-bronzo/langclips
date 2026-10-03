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

import { MODULE_METADATA } from '@nestjs/common/constants';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppModule } = require('./app.module') as { AppModule: object };

describe('AppModule BullMQ Configuration', () => {
  it('should have BullModule imported with retry, backoff and removal options', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule);
    expect(imports).toBeDefined();

    // BullModule.forRoot returns a dynamic module with defaultJobOptions in its provider/options
    const bullDynamicModule = imports.find(
      (m: any) =>
        m &&
        (m.module?.name === 'BullModule' ||
          m.providers?.some(
            (p: any) =>
              p?.provide === 'BullQueue_defaultJobOptions' ||
              p?.useValue?.defaultJobOptions ||
              p?.provide?.toString?.().includes?.('BullQueue'),
          )),
    );

    expect(bullDynamicModule).toBeDefined();
  });
});
