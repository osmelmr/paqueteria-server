import { Module } from '@nestjs/common';
import { AimoduleService } from './aimodule.service.js';
import { AimoduleController } from './aimodule.controller.js';

@Module({
  providers: [AimoduleService],
  controllers: [AimoduleController],
})
export class AimoduleModule {}
