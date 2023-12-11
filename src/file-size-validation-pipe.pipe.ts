import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import * as filetype from 'file-type';
@Injectable()
export class FileSizeValidationPipePipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if(value.size > 5 * 1024 * 1024) {
      throw new HttpException('文件大于 5m', HttpStatus.BAD_REQUEST);
    }
    const typeObj = await filetype.fromBuffer(value.buffer)
    const allowType = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    if(!typeObj || !allowType.includes(typeObj.mime)) throw new HttpException('文件类型不正确', HttpStatus.BAD_REQUEST)
    return value;
  }
}
