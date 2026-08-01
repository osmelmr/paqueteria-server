import { Module } from '@nestjs/common';
import { PackagesController } from './packages.controller.js';
import { PackagesService } from './services/packages-crud.service.js';
import { BusinessService } from './services/business.service.js';
import { UpdateStatusService } from './services/update-status.service.js';
import { PackageAlertService } from './services/package-alert.service.js';

@Module({
  controllers: [PackagesController],
  providers: [
    PackagesService,
    BusinessService,
    UpdateStatusService,
    PackageAlertService,
  ],
  exports: [UpdateStatusService, PackageAlertService],
})
export class PackagesModule {}
