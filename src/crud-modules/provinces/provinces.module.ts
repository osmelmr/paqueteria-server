import { Module } from '@nestjs/common';
import { ProvincesController } from './provinces.controller.js';
import { ProvincesService } from './provinces.service.js';

@Module({
  controllers: [ProvincesController],
  providers: [ProvincesService],
})
export class ProvincesModule {}
