import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'fulltext_test',
})
class ExcelFind {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({
    comment: '店铺名称',
  })
  shop_name: string;

  @Column({
    comment: '省份',
  })
  province: string;

  @Column({
    comment: '系统名称',
  })
  sys_name: string;

  @Column({
    comment: '店铺id',
  })
  shop_id: string;

  @Column({
    comment: '店铺地址',
  })
  shop_addr: string;
}
export {ExcelFind}