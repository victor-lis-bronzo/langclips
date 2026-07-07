import { IsString, IsNotEmpty, Matches } from 'class-validator';

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
}
