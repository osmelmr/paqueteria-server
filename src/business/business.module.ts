import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller.js';
import { BusinessService } from './business.service.js';
import { UpdateStatusService } from './update-status.service.js';
import { PackageAlertService } from './package-alert.service.js';

@Module({
  controllers: [BusinessController],
  providers: [BusinessService, UpdateStatusService, PackageAlertService],
  exports: [UpdateStatusService, PackageAlertService],
})
export class BusinessModule {}
