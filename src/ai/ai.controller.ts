import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PreviewRequestDto } from './dto/preview-request.dto.js';
import { AiPreviewService } from './ai-preview.service.js';

@Controller('ai')
export class AiController {
  constructor(private readonly aiPreviewService: AiPreviewService) {}

  @Post('extract')
  @HttpCode(HttpStatus.OK)
  async extractFromExcel(@Body() dto: PreviewRequestDto) {
    return this.aiPreviewService.extractPackages(dto);
  }
}
