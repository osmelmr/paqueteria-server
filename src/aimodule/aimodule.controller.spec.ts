import { Test, TestingModule } from '@nestjs/testing';
import { AimoduleController } from './aimodule.controller';

describe('AimoduleController', () => {
  let controller: AimoduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AimoduleController],
    }).compile();

    controller = module.get<AimoduleController>(AimoduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
