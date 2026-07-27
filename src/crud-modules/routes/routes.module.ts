import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller.js';
import { VehiclesService } from './vehicles.service.js';
import { DriversService } from './drivers.service.js';
import { RoutesService } from './routes.service.js';

@Module({
  controllers: [RoutesController],
  providers: [VehiclesService, DriversService, RoutesService],
})
export class RoutesModule {}
