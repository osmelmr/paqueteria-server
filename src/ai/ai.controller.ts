import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PreviewRequestDto } from './dto/preview-request.dto.js';
import { AiPreviewService } from './ai-preview.service.js';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiPreviewService: AiPreviewService) {}

  @Post('extract')
  @HttpCode(HttpStatus.OK)
  async extractFromExcel(@Body() dto: PreviewRequestDto) {
    return this.aiPreviewService.extractPackages(dto);
  }
}
