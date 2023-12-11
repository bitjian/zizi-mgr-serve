import { Module } from '@nestjs/common';
import { ExcelFindService } from './excel-find.service';
import { ExcelFindController } from './excel-find.controller';

@Module({
  controllers: [ExcelFindController],
  providers: [ExcelFindService],
})
export class ExcelFindModule {}
