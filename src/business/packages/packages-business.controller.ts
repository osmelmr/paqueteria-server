import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { BusinessService } from './services/business.service.js';
import { BulkAiEntities } from './dto/business-ia-entity.dto.js';
import { UpdateStatusService } from './services/update-status.service.js';
import { PackageAlertService } from './services/package-alert.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import type { Request } from 'express';

@Controller('business')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly updateStatusService: UpdateStatusService,
    private readonly packageAlertService: PackageAlertService,
  ) {}
  @Roles('ADMIN', 'OWNER')
  @Post('process-bulk-ai')
  async processBulkAi(@Body() entities: BulkAiEntities, @Req() req: Request) {
    if (!req.user?.id) {
      return UnauthorizedException;
    }
    const userId = req.user.id;
    return this.businessService.processBulkAiEntities(entities, userId);
  }

  @Roles('ADMIN', 'OWNER', 'AGENT')
  @Post('update-status-bulk')
  async updateStatusBulk(
    @Body()
    body: {
      hbls: string[];
      statusId?: string;
      locationId?: string;
      statusDate?: string;
    },
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.updateStatusService.updateStatusByBulk(
      body.hbls,
      body.statusId,
      body.locationId,
      body.statusDate,
      userId,
    );
  }

  @Roles('ADMIN', 'OWNER', 'AGENT')
  @Patch('packages/:id/resolve-alert')
  async resolveAlert(
    @Param('id') id: string,
    @Body()
    body: {
      guideId?: string;
      recipientId?: string;
      provinceId?: string;
      address?: string;
      weight?: number;
      content?: string;
      arrivalDate?: string;
      statusId?: string;
      locationId?: string;
      anotations?: string;
      alertDescription?: string;
      hbls?: string[];
    },
  ) {
    return this.packageAlertService.resolveAlert(id, body);
  }
}
