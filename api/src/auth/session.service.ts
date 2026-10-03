import { Injectable } from '@nestjs/common';
import { randomUUID, createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class SessionService {
  private readonly secret: string;

  constructor() {
    this.secret =
      process.env.SESSION_SECRET ||
      'lang-clips-anonymous-session-secret-default-key-change-in-prod';
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
