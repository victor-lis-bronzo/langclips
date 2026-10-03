import { SessionService } from './session.service';

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
});
