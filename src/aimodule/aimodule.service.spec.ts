import { Test, TestingModule } from '@nestjs/testing';
import { AimoduleService } from './aimodule.service';

describe('AimoduleService', () => {
  let service: AimoduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AimoduleService],
    }).compile();

    service = module.get<AimoduleService>(AimoduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
