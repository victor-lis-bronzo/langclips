import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return ok status with uptime and version', () => {
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.uptime).toBeDefined();
    expect(typeof result.uptime).toBe('number');
    expect(result.version).toBeDefined();
  });
});
