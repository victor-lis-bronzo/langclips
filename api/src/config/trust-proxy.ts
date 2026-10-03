import { isIP } from 'node:net';

/**
 * Value passed to Fastify's `trustProxy` option.
 *
 * - `false`: proxy headers (X-Forwarded-For etc.) are ignored; `request.ip`
 *   is the socket peer address.
 * - `number`: trust the N closest hops (the N right-most X-Forwarded-For
 *   entries).
 * - `string[]`: trust only peers whose address matches one of these
 *   IPs/CIDRs (or the proxy-addr presets `loopback`, `linklocal`,
 *   `uniquelocal`).
 *
 * `true` (trust every hop) is intentionally NOT supported: it lets any
 * client spoof its IP via X-Forwarded-For and bypass per-client throttling.
 */
export type TrustProxySetting = false | number | string[];

const PRESETS = new Set(['loopback', 'linklocal', 'uniquelocal']);
const DISABLED = new Set(['', 'false', '0']);

function isValidAddressOrCidr(entry: string): boolean {
  if (PRESETS.has(entry)) {
    return true;
  }
  const [address, prefix, ...rest] = entry.split('/');
  if (rest.length > 0) {
    return false;
  }
  const version = isIP(address);
  if (version === 0) {
    return false;
  }
  if (prefix === undefined) {
    return true;
  }
  if (!/^\d+$/.test(prefix)) {
    return false;
  }
  const bits = Number(prefix);
  return bits >= 0 && bits <= (version === 4 ? 32 : 128);
}

/**
 * Parses the TRUST_PROXY env var. Absent/empty/"false"/"0" means "do not
 * trust any proxy". Throws on any other unsupported value (including "true").
 */
export function parseTrustProxy(raw: string | undefined): TrustProxySetting {
  const value = raw?.trim() ?? '';
  if (DISABLED.has(value.toLowerCase())) {
    return false;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const entries = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const invalid = entries.filter((entry) => !isValidAddressOrCidr(entry));
  if (entries.length === 0 || invalid.length > 0) {
    throw new Error(
      `Invalid TRUST_PROXY value "${value}". Use a positive number of hops ` +
        '(e.g. "1") or a comma-separated list of IPs/CIDRs ' +
        '(e.g. "172.18.0.0/16"). Leave unset (or "false") to disable. ' +
        '"true" is not accepted because it trusts X-Forwarded-For from any client.',
    );
  }
  return entries;
}
