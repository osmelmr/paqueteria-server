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
import { CreateMunicipeDto } from './dto/create-municipe.dto.js';
import { UpdateMunicipeDto } from './dto/update-municipe.dto.js';
import { MunicipesService } from './municipes.service.js';

@Controller('municipes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MunicipesController {
  constructor(private municipes: MunicipesService) {}

  @Get()
  findAll() {
    return this.municipes.findAll();
  }

  @Post()
  create(@Body() dto: CreateMunicipeDto) {
    return this.municipes.create(dto.name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMunicipeDto) {
    return this.municipes.update(id, dto.name);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.municipes.delete(id);
  }
}
