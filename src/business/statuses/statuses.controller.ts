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
import { CreateStatusDto } from './dto/create-status.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { StatusesService } from './statuses.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';

@Controller('statuses')
@Roles('ADMIN', 'OWNER')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatusesController {
  constructor(private statuses: StatusesService) {}

  @Roles('KEEPER', 'WORKER', 'ADMIN', 'OWNER', 'AGENT')
  @Get()
  findAll() {
    return this.statuses.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statuses.findById(id);
  }

  @Post()
  create(@Body() dto: CreateStatusDto) {
    return this.statuses.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.statuses.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.statuses.delete(id);
  }
}
