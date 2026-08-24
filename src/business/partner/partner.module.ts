import { Module } from '@nestjs/common';
import { PartnerController } from './partner.controller.js';
import { PartnerService } from './partner.service.js';

@Module({
  controllers: [PartnerController],
  providers: [PartnerService],
})
export class PartnerModule {}
