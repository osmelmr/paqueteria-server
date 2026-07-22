import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { StatusesService } from './statuses.service.js';

@Controller('statuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatusesController {
  constructor(private statuses: StatusesService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    if (category) return this.statuses.findByCategory(category);
    return this.statuses.findAll();
  }

  @Get(':name')
  findByName(@Param('name') name: string) {
    return this.statuses.findByName(name);
  }
}
