import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PackageEntryController } from './package-entry.controller.js';
import { AiPreviewController } from './controllers/ai-preview.controller.js';
import { PackageEntryService } from './package-entry.service.js';
import { PackageProcessorService } from './package-processor.service.js';
import { EntityResolverService } from './services/entity-resolver.service.js';
import { AiClientService } from './services/ai-client.service.js';
import { AiPreviewService } from './services/ai-preview.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [PackageEntryController, AiPreviewController],
  providers: [
    PackageEntryService,
    PackageProcessorService,
    EntityResolverService,
    AiClientService,
    AiPreviewService,
  ],
  exports: [PackageProcessorService],
})
export class PackageEntryModule {}
