import { timingSafeEqual } from 'crypto';

export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export interface MinimalRequest {
  url?: string;
  raw?: {
    url?: string;
  };
  headers: Record<string, string | string[] | undefined>;
}

export interface MinimalReply {
  status(code: number): MinimalReply;
  header(name: string, value: string): MinimalReply;
  send(payload: unknown): MinimalReply;
}

export function handleBullBoardAuth(
  request: MinimalRequest,
  reply: MinimalReply,
  expectedUser?: string,
  expectedPass?: string,
): boolean {
  const rawUrl = request.raw?.url || request.url || '';
  const urlPath = rawUrl.split('?')[0];

  if (urlPath === '/admin/queues' || urlPath.startsWith('/admin/queues/')) {
    if (!expectedUser || !expectedPass) {
      reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Bull Board credentials are not configured.',
      });
      return false;
    }

    const authHeader = request.headers['authorization'];
    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Basic ')
    ) {
      reply.header('WWW-Authenticate', 'Basic realm="Bull Board Admin"');
      reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Missing or invalid Basic authorization header.',
      });
      return false;
    }

    try {
      const base64Credentials = authHeader.substring(6).trim();
      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
      const colonIndex = decoded.indexOf(':');
      if (colonIndex === -1) {
        reply.header('WWW-Authenticate', 'Basic realm="Bull Board Admin"');
        reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid authorization format.',
        });
        return false;
      }

      const user = decoded.substring(0, colonIndex);
      const pass = decoded.substring(colonIndex + 1);

      const userValid = timingSafeStringEqual(user, expectedUser);
      const passValid = timingSafeStringEqual(pass, expectedPass);

      if (!userValid || !passValid) {
        reply.header('WWW-Authenticate', 'Basic realm="Bull Board Admin"');
        reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid username or password.',
        });
        return false;
      }
    } catch {
      reply.header('WWW-Authenticate', 'Basic realm="Bull Board Admin"');
      reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication failed.',
      });
      return false;
    }
  }

  return true;
}
