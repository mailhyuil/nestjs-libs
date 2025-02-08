import { Test, TestingModule } from '@nestjs/testing';
import { NestjsLibsService } from './nestjs-libs.service';

describe('NestjsLibsService', () => {
  let service: NestjsLibsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NestjsLibsService],
    }).compile();

    service = module.get<NestjsLibsService>(NestjsLibsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
