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
import { CreateAgencyDto } from './dto/create-agency.dto.js';
import { UpdateAgencyDto } from './dto/update-agency.dto.js';
import { AgenciesService } from './agencies.service.js';

@Controller('agencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgenciesController {
  constructor(private agencies: AgenciesService) {}

  @Get()
  findAll() {
    return this.agencies.findAll();
  }

  @Post()
  create(@Body() dto: CreateAgencyDto) {
    return this.agencies.create(dto.name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgencyDto) {
    return this.agencies.update(id, dto.name);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.agencies.delete(id);
  }
}
