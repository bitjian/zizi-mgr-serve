import { PartialType } from '@nestjs/mapped-types';
import { CreateExcelFindDto } from './create-excel-find.dto';

export class UpdateExcelFindDto extends PartialType(CreateExcelFindDto) {}
