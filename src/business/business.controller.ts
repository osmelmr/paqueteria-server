import { Body, Controller, Post } from '@nestjs/common';
import { BusinessService } from './business.service.js';
import { BulkAiEntities } from './dto/business-ia-entity.dto.js';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('process-bulk-ai')
  async processBulkAi(@Body() entities: BulkAiEntities) {
    return this.businessService.processBulkAiEntities(entities);
  }
}
