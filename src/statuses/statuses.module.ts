import { Module } from '@nestjs/common';
import { StatusesController } from './statuses.controller.js';
import { StatusesService } from './statuses.service.js';

@Module({
  controllers: [StatusesController],
  providers: [StatusesService],
})
export class StatusesModule {}
