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
import { CreateProvinceDto } from './dto/create-province.dto.js';
import { UpdateProvinceDto } from './dto/update-province.dto.js';
import { ProvincesService } from './provinces.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';

@Controller('provinces')
@Roles('ADMIN', 'OWNER')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProvincesController {
  constructor(private provinces: ProvincesService) {}

  @Get()
  findAll() {
    return this.provinces.findAll();
  }

  @Post()
  create(@Body() dto: CreateProvinceDto) {
    return this.provinces.create(dto.name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProvinceDto) {
    return this.provinces.update(id, dto.name);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.provinces.delete(id);
  }
}
