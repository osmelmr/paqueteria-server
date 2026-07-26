import { Module } from '@nestjs/common';
import { MunicipesController } from './municipes.controller.js';
import { MunicipesService } from './municipes.service.js';

@Module({
  controllers: [MunicipesController],
  providers: [MunicipesService],
})
export class MunicipesModule {}
