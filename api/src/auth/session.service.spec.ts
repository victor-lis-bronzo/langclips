import {
  INSECURE_DEV_SESSION_SECRET,
  resolveSessionSecret,
  SessionService,
} from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    service = new SessionService();
  });

  it('should generate a valid session token', () => {
    const { sessionId, token } = service.createSession();
    expect(sessionId).toBeDefined();
    expect(token).toBeDefined();
    expect(token).toContain(`${sessionId}.`);

    const verifiedId = service.verifyToken(token);
    expect(verifiedId).toBe(sessionId);
  });

  it('should reject a tampered token', () => {
    const { token } = service.createSession();
    const tamperedToken = token.slice(0, -4) + 'abcd';

    const verifiedId = service.verifyToken(tamperedToken);
    expect(verifiedId).toBeNull();
  });

  it('should reject malformed tokens', () => {
    expect(service.verifyToken('')).toBeNull();
    expect(service.verifyToken('invalid-token')).toBeNull();
    expect(service.verifyToken('id.too.many.dots')).toBeNull();
  });

  describe('secret resolution', () => {
    const original = { ...process.env };
    afterEach(() => {
      process.env = { ...original };
    });

    it('throws in production without SESSION_SECRET', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.SESSION_SECRET;
      expect(() => new SessionService()).toThrow(/SESSION_SECRET/);
    });

    it('throws in production with a short SESSION_SECRET', () => {
      process.env.NODE_ENV = 'production';
      process.env.SESSION_SECRET = 'short';
      expect(() => new SessionService()).toThrow(/at least 32/);
    });

    it('works in production with a valid SESSION_SECRET', () => {
      process.env.NODE_ENV = 'production';
      process.env.SESSION_SECRET = 'x'.repeat(32);
      const svc = new SessionService();
      const { sessionId, token } = svc.createSession();
      expect(svc.verifyToken(token)).toBe(sessionId);
    });

    it('uses the explicit dev secret outside production when unset', () => {
      expect(resolveSessionSecret({ NODE_ENV: 'test' })).toBe(
        INSECURE_DEV_SESSION_SECRET,
      );
      expect(resolveSessionSecret({ NODE_ENV: 'development' })).toBe(
        INSECURE_DEV_SESSION_SECRET,
      );
    });

    it('rejects tokens signed with a different secret', () => {
      process.env.NODE_ENV = 'production';
      process.env.SESSION_SECRET = 'a'.repeat(32);
      const { token } = new SessionService().createSession();
      process.env.SESSION_SECRET = 'b'.repeat(32);
      expect(new SessionService().verifyToken(token)).toBeNull();
    });
  });
});
