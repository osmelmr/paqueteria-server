import { Module } from '@nestjs/common';
import { GenerateController } from './generate.controller.js';
import { GenerateService } from './generate.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [GenerateController],
  providers: [GenerateService],
})
export class GenerateModule {}
