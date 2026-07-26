import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiClientService } from './ai-client.service.js';
import { AiPreviewService } from './ai-preview.service.js';

@Module({
  controllers: [AiController],
  providers: [AiClientService, AiPreviewService],
})
export class AiModule {}
