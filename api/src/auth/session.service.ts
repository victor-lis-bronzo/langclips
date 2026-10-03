import { Injectable } from '@nestjs/common';
import { randomUUID, createHmac, timingSafeEqual } from 'crypto';

export const MIN_SESSION_SECRET_LENGTH = 32;

// Explicit, public value used ONLY when NODE_ENV is not "production" and
// SESSION_SECRET is unset. Never valid in production.
export const INSECURE_DEV_SESSION_SECRET =
  'insecure-dev-only-session-secret-do-not-use-in-production';

export function resolveSessionSecret(
  env: Record<string, string | undefined>,
): string {
  const secret = env.SESSION_SECRET?.trim();
  if (env.NODE_ENV === 'production') {
    if (!secret || secret.length < MIN_SESSION_SECRET_LENGTH) {
      throw new Error(
        `SESSION_SECRET must be set to at least ${MIN_SESSION_SECRET_LENGTH} characters in production.`,
      );
    }
    return secret;
  }
  return secret || INSECURE_DEV_SESSION_SECRET;
}

@Injectable()
export class SessionService {
  private readonly secret: string;

  constructor() {
    this.secret = resolveSessionSecret(process.env);
  }

  createSession(): { sessionId: string; token: string } {
    const sessionId = randomUUID();
    const signature = this.sign(sessionId);
    return {
      sessionId,
      token: `${sessionId}.${signature}`,
    };
  }

  verifyToken(token: string): string | null {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [sessionId, signature] = parts;
    if (!sessionId || !signature) {
      return null;
    }

    const expectedSignature = this.sign(sessionId);

    try {
      const signatureBuf = Buffer.from(signature, 'hex');
      const expectedBuf = Buffer.from(expectedSignature, 'hex');

      if (signatureBuf.length !== expectedBuf.length) {
        return null;
      }

      if (!timingSafeEqual(signatureBuf, expectedBuf)) {
        return null;
      }

      return sessionId;
    } catch {
      return null;
    }
  }

  private sign(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('hex');
  }
}
