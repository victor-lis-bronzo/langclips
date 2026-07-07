import { Controller, Post, Body } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';

@Controller('uploads')
export class UploadsController {
  constructor(private storageService: StorageService) {}

  @Post()
  async generatePresignedUrl(@Body() body: GeneratePresignedUrlDto) {
    const uploadUrl = await this.storageService.generatePresignedUrl(body.filename, body.contentType);
    return { uploadUrl };
  }
}
