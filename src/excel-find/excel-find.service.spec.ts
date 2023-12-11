import { Test, TestingModule } from '@nestjs/testing';
import { ExcelFindService } from './excel-find.service';

describe('ExcelFindService', () => {
  let service: ExcelFindService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelFindService],
    }).compile();

    service = module.get<ExcelFindService>(ExcelFindService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
