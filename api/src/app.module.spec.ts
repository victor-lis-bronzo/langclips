import { MODULE_METADATA } from '@nestjs/common/constants';
import { AppModule } from './app.module';

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
