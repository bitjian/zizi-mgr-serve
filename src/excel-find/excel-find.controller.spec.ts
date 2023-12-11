import { Test, TestingModule } from '@nestjs/testing';
import { ExcelFindController } from './excel-find.controller';
import { ExcelFindService } from './excel-find.service';

describe('ExcelFindController', () => {
  let controller: ExcelFindController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExcelFindController],
      providers: [ExcelFindService],
    }).compile();

    controller = module.get<ExcelFindController>(ExcelFindController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
