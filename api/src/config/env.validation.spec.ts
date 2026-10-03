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
        }),
      ).toThrow(/CORS_ORIGINS must be configured in production/);
    });

    it('should fail in production when CORS_ORIGINS contains wildcard "*"', () => {
      expect(() =>
        validate({
          ...baseValidConfig,
          NODE_ENV: 'production',
          CORS_ORIGINS: 'https://app.example.com, *',
        }),
      ).toThrow(/Wildcard "\*" origin is not permitted in CORS_ORIGINS/);
    });

    it('should pass in production when explicit CORS_ORIGINS are provided', () => {
      expect(() =>
        validate({
          ...baseValidConfig,
          NODE_ENV: 'production',
          CORS_ORIGINS: 'https://langclips.com, https://admin.langclips.com',
        }),
      ).not.toThrow();
    });
  });
});
