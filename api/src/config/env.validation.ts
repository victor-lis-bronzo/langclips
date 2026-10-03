import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { MIN_SESSION_SECRET_LENGTH } from '../auth/session.service';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  STORAGE_ENDPOINT!: string;

  @IsOptional()
  @IsString()
  STORAGE_REGION?: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_ACCESS_KEY_ID!: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_SECRET_ACCESS_KEY!: string;

  @IsOptional()
  @IsString()
  STORAGE_FORCE_PATH_STYLE?: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_BUCKET_NAME!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_PORT!: string;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsOptional()
  @IsString()
  PORT?: string;

  @IsOptional()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV?: string;

  @IsOptional()
  @IsString()
  ENABLE_BULL_BOARD?: string;

  @IsOptional()
  @IsString()
  BULL_BOARD_USER?: string;

  @IsOptional()
  @IsString()
  BULL_BOARD_PASSWORD?: string;

  @IsOptional()
  @IsString()
  SESSION_SECRET?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  if (validated.ENABLE_BULL_BOARD === 'true') {
    if (
      !validated.BULL_BOARD_USER?.trim() ||
      !validated.BULL_BOARD_PASSWORD?.trim()
    ) {
      throw new Error(
        'BULL_BOARD_USER and BULL_BOARD_PASSWORD must be configured when ENABLE_BULL_BOARD is enabled.',
      );
    }
  }

  if (validated.NODE_ENV === 'production') {
    const sessionSecret = validated.SESSION_SECRET?.trim();
    if (!sessionSecret || sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
      throw new Error(
        `SESSION_SECRET must be set to at least ${MIN_SESSION_SECRET_LENGTH} characters in production.`,
      );
    }
    const origins = validated.CORS_ORIGINS?.split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    if (!origins || origins.length === 0) {
      throw new Error('CORS_ORIGINS must be configured in production.');
    }
    if (origins.includes('*')) {
      throw new Error(
        'Wildcard "*" origin is not permitted in CORS_ORIGINS in production.',
      );
    }
  }

  return validated;
}
