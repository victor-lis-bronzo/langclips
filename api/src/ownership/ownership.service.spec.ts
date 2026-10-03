import { OwnershipService } from './ownership.service';
import Redis from 'ioredis';

describe('OwnershipService', () => {
  let service: OwnershipService;
  let redisMock: {
    set: jest.Mock;
    get: jest.Mock;
    del: jest.Mock;
    pipeline: jest.Mock;
  };

  beforeEach(() => {
    redisMock = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
      pipeline: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnThis(),
        del: jest.fn().mockReturnThis(),
        get: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
    };
    service = new OwnershipService(redisMock as unknown as Redis);
  });

  it('should set owner for a file with TTL', async () => {
    await service.setOwner('videos/test.mp4', 'session-123', 3600);

    expect(redisMock.set).toHaveBeenCalledWith(
      'owner:videos/test.mp4',
      'session-123',
      'EX',
      3600,
    );
  });

  it('should check if sessionId is owner', async () => {
    redisMock.get.mockResolvedValueOnce('session-123');

    const isOwner = await service.isOwner('videos/test.mp4', 'session-123');
    expect(isOwner).toBe(true);

    redisMock.get.mockResolvedValueOnce('different-session');
    const isOtherOwner = await service.isOwner(
      'videos/test.mp4',
      'session-123',
    );
    expect(isOtherOwner).toBe(false);

    redisMock.get.mockResolvedValueOnce(null);
    const isNonExistent = await service.isOwner(
      'videos/test.mp4',
      'session-123',
    );
    expect(isNonExistent).toBe(false);
  });

  it('should verify ownership for multiple files', async () => {
    const pipelineMock = {
      get: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        [null, 'session-123'],
        [null, 'session-123'],
      ]),
    };
    redisMock.pipeline.mockReturnValue(pipelineMock);

    const allOwned = await service.areAllOwners(
      ['file1.mp4', 'file2.mp4'],
      'session-123',
    );
    expect(allOwned).toBe(true);
    expect(pipelineMock.get).toHaveBeenCalledTimes(2);

    pipelineMock.exec.mockResolvedValueOnce([
      [null, 'session-123'],
      [null, 'session-other'],
    ]);
    const notAllOwned = await service.areAllOwners(
      ['file1.mp4', 'file2.mp4'],
      'session-123',
    );
    expect(notAllOwned).toBe(false);
  });

  it('should delete ownership records', async () => {
    await service.deleteOwnership('videos/test.mp4');
    expect(redisMock.del).toHaveBeenCalledWith('owner:videos/test.mp4');
  });
});
