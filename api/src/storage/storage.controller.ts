import { Controller, Get, Query } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('download-url')
  async getDownloadUrl(@Query('fileKey') fileKey: string) {
    const downloadUrl = await this.storageService.generateDownloadUrl(fileKey);
    return { downloadUrl };
  }
}
