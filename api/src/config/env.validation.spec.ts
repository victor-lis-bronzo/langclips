import 'reflect-metadata';
import { validate } from './env.validation';

describe('env.validation', () => {
  const baseValidConfig: Record<string, unknown> = {
    STORAGE_ENDPOINT: 'https://s3.amazonaws.com',
    STORAGE_ACCESS_KEY_ID: 'access_key',
    STORAGE_SECRET_ACCESS_KEY: 'secret_key',
    STORAGE_BUCKET_NAME: 'test-bucket',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
  };

  const validSecret = 'a'.repeat(32);

  it('should pass validation with valid minimum config', () => {
    expect(() => validate(baseValidConfig)).not.toThrow();
  });

  it('should throw when required storage or redis variables are missing', () => {
    expect(() =>
      validate({
        STORAGE_ENDPOINT: 'https://s3.amazonaws.com',
      }),
    ).toThrow();
  });

  describe('Bull Board configuration validation', () => {
    it('should fail if ENABLE_BULL_BOARD=true but credentials are empty', () => {
      expect(() =>
        validate({
          ...baseValidConfig,
          ENABLE_BULL_BOARD: 'true',
        }),
      ).toThrow(
        /BULL_BOARD_USER and BULL_BOARD_PASSWORD must be configured when ENABLE_BULL_BOARD is enabled/,
      );
    });

    it('should pass if ENABLE_BULL_BOARD=true and credentials are provided', () => {
      expect(() =>
        validate({
          ...baseValidConfig,
          ENABLE_BULL_BOARD: 'true',
          BULL_BOARD_USER: 'admin',
          BULL_BOARD_PASSWORD: 'password123',
        }),
      ).not.toThrow();
    });

    it('should pass if ENABLE_BULL_BOARD is false without credentials', () => {
      expect(() =>
        validate({
          ...baseValidConfig,
          ENABLE_BULL_BOARD: 'false',
        }),
      ).not.toThrow();
    });
  });

  describe('CORS in production validation', () => {
    it('should fail in production when CORS_ORIGINS is not set', () => {
      expect(() =>
        validate({
          ...baseValidConfig,
          NODE_ENV: 'production',
          SESSION_SECRET: validSecret,
        }),
      ).toThrow(/CORS_ORIGINS must be configured in production/);
    });

    it('should fail in production when CORS_ORIGINS contains wildcard "*"', () => {
      expect(() =>
        validate({
          ...baseValidConfig,
          NODE_ENV: 'production',
          SESSION_SECRET: validSecret,
          CORS_ORIGINS: 'https://app.example.com, *',
        }),
      ).toThrow(/Wildcard "\*" origin is not permitted in CORS_ORIGINS/);
    });

    it('should pass in production when explicit CORS_ORIGINS are provided', () => {
      expect(() =>
        validate({
          ...baseValidConfig,
          NODE_ENV: 'production',
          SESSION_SECRET: validSecret,
          CORS_ORIGINS: 'https://langclips.com, https://admin.langclips.com',
        }),
      ).not.toThrow();
    });
  });

  describe('SESSION_SECRET validation', () => {
    const prod = {
      ...baseValidConfig,
      NODE_ENV: 'production',
      CORS_ORIGINS: 'https://langclips.com',
    };

    it('should fail in production when SESSION_SECRET is missing', () => {
      expect(() => validate(prod)).toThrow(/SESSION_SECRET must be set/);
    });

    it('should fail in production when SESSION_SECRET is blank', () => {
      expect(() => validate({ ...prod, SESSION_SECRET: '   ' })).toThrow(
        /SESSION_SECRET must be set/,
      );
    });

    it('should fail in production when SESSION_SECRET is too short', () => {
      expect(() => validate({ ...prod, SESSION_SECRET: 'short' })).toThrow(
        /at least 32 characters/,
      );
    });

    it('should pass in production with a valid SESSION_SECRET', () => {
      expect(() =>
        validate({ ...prod, SESSION_SECRET: validSecret }),
      ).not.toThrow();
    });

    it.each(['development', 'test'])(
      'should not require SESSION_SECRET in %s',
      (env) => {
        expect(() =>
          validate({ ...baseValidConfig, NODE_ENV: env }),
        ).not.toThrow();
      },
    );
  });

  describe('TRUST_PROXY validation', () => {
    it.each(['1', '2', 'false', '172.18.0.0/16', '10.0.0.1, loopback'])(
      'should accept TRUST_PROXY=%p',
      (value) => {
        expect(() =>
          validate({ ...baseValidConfig, TRUST_PROXY: value }),
        ).not.toThrow();
      },
    );

    it.each(['true', '*', 'proxy.local', '10.0.0.0/33'])(
      'should reject TRUST_PROXY=%p',
      (value) => {
        expect(() =>
          validate({ ...baseValidConfig, TRUST_PROXY: value }),
        ).toThrow(/Invalid TRUST_PROXY value/);
      },
    );
  });
});
