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

  it('should verify ownership for clips via job prefix', async () => {
    // Direct key not found, but job owner matches
    redisMock.get
      .mockResolvedValueOnce(null) // owner:clips/job-abc/clip-1.mp4
      .mockResolvedValueOnce('session-123'); // owner:job:job-abc

    const isOwner = await service.isOwner(
      'clips/job-abc/clip-1.mp4',
      'session-123',
    );
    expect(isOwner).toBe(true);
    expect(redisMock.get).toHaveBeenCalledWith('owner:job:job-abc');
  });

  it('should verify ownership for decks via job prefix', async () => {
    redisMock.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('session-123');

    const isOwner = await service.isOwner('decks/job-xyz.json', 'session-123');
    expect(isOwner).toBe(true);
    expect(redisMock.get).toHaveBeenCalledWith('owner:job:job-xyz');
  });

  it('should verify ownership for multiple files', async () => {
    redisMock.get
      .mockResolvedValueOnce('session-123')
      .mockResolvedValueOnce('session-123');

    const allOwned = await service.areAllOwners(
      ['file1.mp4', 'file2.mp4'],
      'session-123',
    );
    expect(allOwned).toBe(true);

    redisMock.get
      .mockResolvedValueOnce('session-123')
      .mockResolvedValueOnce('session-other');

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
