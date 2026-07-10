import { IsString, IsNotEmpty } from 'class-validator';

export class ProcessVideoDto {
  @IsString()
  @IsNotEmpty()
  fileKey: string;
}
