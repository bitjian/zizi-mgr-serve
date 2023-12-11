CREATE TABLE
  `fulltext_test` (
    `id` int (11) NOT NULL AUTO_INCREMENT,
    `shop_name` varchar(255) NOT NULL COMMENT '店名',
    `province` varchar(255) DEFAULT NULL COMMENT '省份',
    `sys_name` varchar(255) DEFAULT NULL COMMENT '系统名',
    `shop_id` varchar(255) DEFAULT NULL COMMENT '店铺id',
    `shop_addr` varchar(255) DEFAULT NULL COMMENT '店铺详细地址',
    PRIMARY KEY (`id`),
    FULLTEXT KEY `index_content_tag` (`shop_name`, `sys_name`, `shop_addr`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 40446 DEFAULT CHARSET = utf8