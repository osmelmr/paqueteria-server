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
  getAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('guideId') guideId?: string,
  ) {
    const user = req.user;
    return this.service.getAll(
      user.agencyId,
      search,
      Number(page) || 1,
      Number(limit) || 50,
      guideId || undefined,
    );
  }

  @Get('stats')
  getStats(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('guideId') guideId?: string,
  ) {
    const user = req.user;
    return this.service.getStats(user.agencyId, search, guideId || undefined);
  }

  @Get('guides')
  getGuides(@Req() req: any) {
    const user = req.user;
    return this.service.getGuides(user.agencyId);
  }

  @Get('story')
  getStory(@Req() req: any, @Query('packageId') packageId: string) {
    const user = req.user;
    return this.service.getStory(packageId, user.agencyId);
  }
}
