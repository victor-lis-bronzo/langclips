import { FastifyAdapter } from '@nestjs/platform-fastify';
import { parseTrustProxy } from './trust-proxy';

/**
 * Builds the Fastify adapter used by the app. Proxy trust comes from the
 * optional TRUST_PROXY env var (see ./trust-proxy.ts); when unset, proxy
 * headers are ignored and `request.ip` is the direct peer address.
 */
export function createFastifyAdapter(
  env: Record<string, string | undefined> = process.env,
): FastifyAdapter {
  return new FastifyAdapter({ trustProxy: parseTrustProxy(env.TRUST_PROXY) });
}
