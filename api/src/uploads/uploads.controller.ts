import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { GeneratePresignedUrlDto } from './dtos/generate-presigned-url.dto';
import { OwnershipService } from '../ownership/ownership.service';
import { SessionGuard, AnonymousSession } from '../auth/session.guard';
import { CurrentSession } from '../auth/current-session.decorator';

@Controller('uploads')
@UseGuards(SessionGuard)
export class UploadsController {
  constructor(
    private readonly storageService: StorageService,
    private readonly ownershipService: OwnershipService,
  ) {}

  @Post('/generate-presigned-url')
  async generatePresignedUrl(
    @Body() body: GeneratePresignedUrlDto,
    @CurrentSession() session: AnonymousSession,
  ) {
    const { uploadUrl, fileKey } =
      await this.storageService.generatePresignedUrl(
        body.filename,
        body.contentType,
      );

    if (session?.id) {
      await this.ownershipService.setOwner(fileKey, session.id);
    }

    return { uploadUrl, fileKey };
  }
}
