import { ExecutionContext } from '@nestjs/common';
import { SessionGuard } from './session.guard';
import { SessionService } from './session.service';

describe('SessionGuard', () => {
  let guard: SessionGuard;
  let sessionService: SessionService;

  beforeEach(() => {
    sessionService = new SessionService();
    guard = new SessionGuard(sessionService);
  });

  function createMockContext(headers: Record<string, string | undefined> = {}) {
    const request: any = { headers };
    const responseHeaders: Record<string, string> = {};
    const reply: any = {
      header: (name: string, value: string) => {
        responseHeaders[name.toLowerCase()] = value;
        return reply;
      },
      getHeader: (name: string) => responseHeaders[name.toLowerCase()],
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => reply,
      }),
    } as unknown as ExecutionContext;

    return { context, request, reply, responseHeaders };
  }

  it('should reuse valid existing session token from x-session-token', () => {
    const { sessionId, token } = sessionService.createSession();
    const { context, request, responseHeaders } = createMockContext({
      'x-session-token': token,
    });

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
    expect(request.session).toEqual({ id: sessionId });
    expect(responseHeaders['x-session-token']).toBeUndefined();
  });

  it('should reuse valid existing session token from Authorization Bearer', () => {
    const { sessionId, token } = sessionService.createSession();
    const { context, request, responseHeaders } = createMockContext({
      authorization: `Bearer ${token}`,
    });

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
    expect(request.session).toEqual({ id: sessionId });
    expect(responseHeaders['x-session-token']).toBeUndefined();
  });

  it('should create new session when token is missing', () => {
    const { context, request, responseHeaders } = createMockContext({});

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
    expect(request.session?.id).toBeDefined();
    expect(responseHeaders['x-session-token']).toBeDefined();
    expect(responseHeaders['access-control-expose-headers']).toContain(
      'x-session-token',
    );
  });

  it('should create new session when token is invalid or tampered', () => {
    const { context, request, responseHeaders } = createMockContext({
      'x-session-token': 'invalid.token',
    });

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
    expect(request.session?.id).toBeDefined();
    expect(responseHeaders['x-session-token']).toBeDefined();
  });
});
