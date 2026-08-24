import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { ConfirmGuideDto } from './dto/confirm-guide.dto.js';
import { CreateGuideDto } from './dto/create-guide.dto.js';
import { UpdateGuideDto } from './dto/update-guide.dto.js';
import { UploadGuideDto } from './dto/upload-guide.dto.js';
import { GuidesService } from './guides.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';

@Controller('guides')
@Roles('ADMIN', 'OWNER')
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
  create(@Body() dto: CreateGuideDto) {
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGuideDto) {
    return this.guides.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.guides.delete(id);
  }
}
