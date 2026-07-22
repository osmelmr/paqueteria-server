import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ConfirmGuideDto } from './dto/confirm-guide.dto.js';
import { UploadGuideDto } from './dto/upload-guide.dto.js';
import { GuidesService } from './guides.service.js';

@Controller('guides')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuidesController {
  constructor(private guides: GuidesService) {}

  @Get()
  findAll() {
    return this.guides.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guides.findById(id);
  }

  @Post()
  create(@Body() dto: { externalRef: string; agency: string }) {
    return this.guides.createManual(dto);
  }

  @Post('upload')
  upload(@Body() dto: UploadGuideDto) {
    return this.guides.uploadPreview(dto.rows);
  }

  @Post('confirm')
  confirm(@Body() dto: ConfirmGuideDto) {
    return this.guides.confirm(dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.guides.delete(id);
  }
}
