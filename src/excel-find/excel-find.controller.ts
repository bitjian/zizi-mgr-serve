import { Controller, Post, Body, UploadedFile, UseInterceptors, HttpException, HttpStatus, Inject, } from '@nestjs/common';
import { ExcelFindService } from './excel-find.service';
import { QueryExcelFindDto } from './dto/query-excel-find.dto';
import { FileInterceptor } from '@nestjs/platform-express';


import xlsx from 'node-xlsx';
import { FileSizeValidationPipePipe } from 'src/file-size-validation-pipe.pipe';
import { WINSTON_LOGGER_TOKEN } from 'src/winston/winston.module';

@Controller('excel-find')
export class ExcelFindController {
  @Inject(WINSTON_LOGGER_TOKEN)
  private logger;
  constructor(private readonly excelFindService: ExcelFindService) { }
  @Post('uploadExcel')
  @UseInterceptors(FileInterceptor('file'))

  async uploadExcel(@UploadedFile(FileSizeValidationPipePipe) file: Express.Multer.File) {
    let dataList, headKey
    try {
      const xlsxData = xlsx.parse(file.buffer)
      dataList = xlsxData[0].data.filter(Boolean)
      headKey = dataList.splice(0, 1)[0]
    } catch (err) {
      this.logger.log(err, ExcelFindController.name)
      throw new HttpException('上传失败了哦~', HttpStatus.BAD_REQUEST)
    }
    const rowCount = await this.excelFindService.insertData(headKey, dataList)
    return { code: 0, data: `上传成功 ${rowCount}条数据` }
  }
  @Post('getShopList')
  async getShopList(@Body() queryExcelFindDto: QueryExcelFindDto) {
    const ret = await this.excelFindService.getShopList(queryExcelFindDto);
    return { code: 0, data:ret }
  }
  @Post('delAllShop')
  async delAllShop() {
    await this.excelFindService.delAllShop()
    return { code: 0, data: '删除成功' }
  }
}
