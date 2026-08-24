import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PartnerService } from './partner.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';

@Controller('partner')
@Roles('ADMIN', 'OWNER', 'PARTNER', 'STOREKEEPER', 'WORKER')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartnerController {
  constructor(private readonly service: PartnerService) {}

  @Get()
  getAll(@Req() req: any) {
    const user = req.user;
    return this.service.getAll(user.agencyId);
  }

  @Get('story')
  getStory(@Req() req: any, @Query('packageId') packageId: string) {
    const user = req.user;
    return this.service.getStory(packageId, user.agencyId);
  }
}
