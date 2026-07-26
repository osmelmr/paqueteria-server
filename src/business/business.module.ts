import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller.js';
import { BusinessService } from './business.service.js';
import { UpdateStatusService } from './update-status.service.js';

@Module({
  controllers: [BusinessController],
  providers: [BusinessService, UpdateStatusService],
  exports: [UpdateStatusService],
})
export class BusinessModule {}
