import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { BusinessService } from './services/business.service.js';
import { BulkAiEntities } from './dto/business-ia-entity.dto.js';
import { UpdateStatusService } from './services/update-status.service.js';
import { PackageAlertService } from './services/package-alert.service.js';

@Controller('business')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly updateStatusService: UpdateStatusService,
    private readonly packageAlertService: PackageAlertService,
  ) {}

  @Post('process-bulk-ai')
  async processBulkAi(@Body() entities: BulkAiEntities) {
    return this.businessService.processBulkAiEntities(entities);
  }

  @Post('update-status-bulk')
  async updateStatusBulk(
    @Body() body: { hbls: string[]; statusId?: string; locationId?: string },
  ) {
    return this.updateStatusService.updateStatusByBulk(
      body.hbls,
      body.statusId,
      body.locationId,
    );
  }

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
