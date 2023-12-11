import { HttpCode, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateExcelFindDto } from './dto/create-excel-find.dto';
import { UpdateExcelFindDto } from './dto/update-excel-find.dto';
import { QueryExcelFindDto } from './dto/query-excel-find.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { WINSTON_LOGGER_TOKEN } from 'src/winston/winston.module';
import { ExcelFind } from './entities/excel-find.entity';
const MAX_COUNT = 20 * 10000
@Injectable()
export class ExcelFindService {
  @InjectEntityManager()
  private manager: EntityManager;
  @Inject(WINSTON_LOGGER_TOKEN)
  private logger;
  async getShopList(params: QueryExcelFindDto, isLike = false) {
    const {
      keyword = '',
      province,
      sys_name,
      page: { pageNum = 1 },
    } = { page: {}, ...params };
    let { page: { pageSize = 10 } } = { page: {}, ...params };
    if(pageSize > 100) {
      pageSize = 100
    }
    let sqlStr = `select * from fulltext_test `;
    let whereStr = keyword.length >= 4 && isLike === false
      ? ` where match(shop_name,shop_addr,sys_name) against(? in boolean mode)`
      : ' where 1=1';
    const db_params = [];
    if (keyword.length >= 4 && isLike === false) {
      db_params.push(keyword.replaceAll(/-/g, ''))
    } else {
      whereStr += ' and (shop_name like ? or shop_addr like ? or sys_name like ?)';
      db_params.push(...[`%${keyword}%`, `%${keyword}%`, `%${keyword}%`])
    }
    if (province) {
      whereStr += ' and province like ?';
      db_params.push(`%${province}%`);
    }
    if (sys_name) {
      whereStr += ' and sys_name like ?';
      db_params.push(`%${sys_name}%`);
    }
    sqlStr = `${sqlStr} ${whereStr} limit ${(pageNum - 1) * pageSize
      },${pageSize}`;
    try {
      const [ret, count] = await Promise.all([this.manager.query(sqlStr, db_params), this.manager.query(`select count(*) as total from fulltext_test ${whereStr}`, db_params)])
      if (count !== 0 && ret.length === 0 && isLike === false) {
        return await this.getShopList(params, true)
      } else {
        return { list: ret, count: Number(count[0].total) };
      }
    } catch (error) {
      this.logger.log(error, ExcelFindService.name)
      throw new HttpException('出错鸟~', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async insertData(headKey: Array<string>, dataList: Array<string[]>) {
    if (headKey.length === 0 || dataList.length === 0) {
      throw new HttpException('木得数据,请按模板填写数据', HttpStatus.BAD_REQUEST)
    }
    const count = await this.manager.query('select count(*) as total from fulltext_test')
    if (Number(count[0].total) > MAX_COUNT) {
      throw new HttpException('木得数据,请按模板填写数据', HttpStatus.BAD_REQUEST)
    }
    const dataValues = []
    dataList.forEach(item => {
      const data = {}
      headKey.forEach((keyValue, index) => {
        data[keyValue] = item[index]
      })
      dataValues.push(data)
    })
    const queryBuilder = this.manager.createQueryBuilder();
    try {
      let affectedRows = 0
      const { raw } = await queryBuilder.insert().into('fulltext_test', headKey).values(dataValues).execute()
      affectedRows = raw.affectedRows
      return affectedRows
    } catch (error) {
      this.logger.log(error, ExcelFindService.name)
      throw new HttpException('出错鸟~', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async delAllShop() {
    try {
      const sql = `truncate fulltext_test`
      await this.manager.query(sql)
    } catch (error) {
      this.logger.log(error, ExcelFindService.name)
      throw new HttpException('出错鸟~', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
