import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { StatisticsService } from './statistics.service.js';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly statistics: StatisticsService) {}

  @Get()
  main() {
    return this.statistics.main();
  }
}
