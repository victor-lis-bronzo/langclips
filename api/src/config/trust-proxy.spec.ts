import { parseTrustProxy } from './trust-proxy';
import { createFastifyAdapter } from './fastify-adapter';

describe('parseTrustProxy', () => {
  it.each([undefined, '', '   ', 'false', 'FALSE', '0'])(
    'should disable proxy trust for %p',
    (value) => {
      expect(parseTrustProxy(value)).toBe(false);
    },
  );

  it('should parse a number of hops', () => {
    expect(parseTrustProxy('1')).toBe(1);
    expect(parseTrustProxy(' 2 ')).toBe(2);
  });

  it('should parse a comma-separated list of IPs, CIDRs and presets', () => {
    expect(
      parseTrustProxy('172.18.0.0/16, 10.0.0.1,::1/128,fd00::/8,loopback'),
    ).toEqual(['172.18.0.0/16', '10.0.0.1', '::1/128', 'fd00::/8', 'loopback']);
  });

  it.each([
    'true',
    'TRUE',
    '*',
    '-1',
    '1.5',
    'proxy.local',
    '10.0.0.0/33',
    '::/129',
    '10.0.0.0/8/1',
    '10.0.0.0/x',
    ',',
  ])('should reject %p', (value) => {
    expect(() => parseTrustProxy(value)).toThrow(/Invalid TRUST_PROXY value/);
  });
});

describe('createFastifyAdapter', () => {
  async function ipFor(
    env: Record<string, string | undefined>,
    headers: Record<string, string>,
    remoteAddress = '127.0.0.1',
  ): Promise<string> {
    const adapter = createFastifyAdapter(env);
    const fastify = adapter.getInstance();
    fastify.get('/ip', (request) => ({ ip: request.ip }));
    await fastify.ready();
    const response = await fastify.inject({
      method: 'GET',
      url: '/ip',
      headers,
      remoteAddress,
    });
    await fastify.close();
    return response.json<{ ip: string }>().ip;
  }

  it('should ignore X-Forwarded-For when TRUST_PROXY is unset', async () => {
    await expect(ipFor({}, { 'x-forwarded-for': '203.0.113.7' })).resolves.toBe(
      '127.0.0.1',
    );
  });

  it('should use X-Forwarded-For when the peer is a trusted proxy', async () => {
    await expect(
      ipFor({ TRUST_PROXY: '127.0.0.1' }, { 'x-forwarded-for': '203.0.113.7' }),
    ).resolves.toBe('203.0.113.7');
  });

  it('should ignore X-Forwarded-For from a peer outside the trusted CIDRs', async () => {
    await expect(
      ipFor(
        { TRUST_PROXY: '172.18.0.0/16' },
        { 'x-forwarded-for': '203.0.113.7' },
        '198.51.100.9',
      ),
    ).resolves.toBe('198.51.100.9');
  });

  it('should only trust the configured number of hops', async () => {
    await expect(
      ipFor(
        { TRUST_PROXY: '1' },
        { 'x-forwarded-for': '6.6.6.6, 203.0.113.7' },
      ),
    ).resolves.toBe('203.0.113.7');
  });
});
