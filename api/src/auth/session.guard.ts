import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SessionService } from './session.service';

export class AnonymousSession {
  id!: string;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const reply = http.getResponse();

    let token = request.headers['x-session-token'] as string | undefined;

    if (!token && request.headers['authorization']) {
      const authHeader = request.headers['authorization'] as string;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    let sessionId: string | null = null;
    if (token) {
      sessionId = this.sessionService.verifyToken(token);
    }

    if (!sessionId) {
      const newSession = this.sessionService.createSession();
      sessionId = newSession.sessionId;

      if (reply?.header) {
        reply.header('x-session-token', newSession.token);
        reply.header('access-control-expose-headers', 'x-session-token');
      }
    }

    request.session = { id: sessionId };
    return true;
  }
}
