import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { PreviewRequestDto } from '../dto/preview-request.dto.js';
import { AiPreviewService } from '../services/ai-preview.service.js';

@Controller('package-entry')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiPreviewController {
  constructor(private readonly aiPreviewService: AiPreviewService) {}

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  async preview(@Body() dto: PreviewRequestDto) {
    return this.aiPreviewService.generatePreview(dto);
  }
}
