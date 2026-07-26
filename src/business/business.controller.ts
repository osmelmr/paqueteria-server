import { Body, Controller, Post } from '@nestjs/common';
import { BusinessService } from './business.service.js';
import { BulkAiEntities } from './dto/business-ia-entity.dto.js';
import { UpdateStatusService } from './update-status.service.js';

@Controller('business')
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly updateStatusService: UpdateStatusService,
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
}
