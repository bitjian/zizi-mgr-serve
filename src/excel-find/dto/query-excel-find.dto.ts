interface IPage {
  pageNum: number;
  pageSize: number;
}
export class QueryExcelFindDto {
  keyword: string;
  province?: string;
  sys_name?: string;
  page: IPage;
}
