import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { OwnershipService } from '../ownership/ownership.service';
import { SessionGuard, AnonymousSession } from '../auth/session.guard';
import { CurrentSession } from '../auth/current-session.decorator';

@Controller('storage')
@UseGuards(SessionGuard)
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly ownershipService: OwnershipService,
  ) {}

  @Get('download-url')
  async getDownloadUrl(
    @Query('fileKey') fileKey: string,
    @CurrentSession() session: AnonymousSession,
  ) {
    if (!fileKey || !fileKey.trim()) {
      throw new BadRequestException('O parâmetro fileKey é obrigatório.');
    }

    const isOwner = await this.ownershipService.isOwner(fileKey, session.id);
    if (!isOwner) {
      throw new ForbiddenException(
        'Acesso negado: você não tem permissão para acessar este arquivo.',
      );
    }

    const downloadUrl = await this.storageService.generateDownloadUrl(fileKey);
    return { downloadUrl };
  }
}
