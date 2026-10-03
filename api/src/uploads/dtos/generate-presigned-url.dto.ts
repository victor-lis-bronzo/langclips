import {
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export class GeneratePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(video|audio)\/[a-zA-Z0-9.+_-]+$/, {
    message: 'contentType must be a valid video or audio mime type',
  })
  contentType: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(MAX_FILE_SIZE, {
    message: 'fileSize must not exceed 100MB (104857600 bytes)',
  })
  fileSize?: number;
}
