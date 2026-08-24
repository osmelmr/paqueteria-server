import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { StatisticsService } from './statistics.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('statistics')
@Roles('ADMIN', 'OWNER', 'STOREKEEPER', 'WORKER')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly statistics: StatisticsService) {}

  @Get()
  main() {
    return this.statistics.main();
  }
}
