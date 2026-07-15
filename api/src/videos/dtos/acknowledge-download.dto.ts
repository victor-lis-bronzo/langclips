import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class AcknowledgeDownloadDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  fileKeys: string[];
}
