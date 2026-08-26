import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

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

  return validated;
}
