import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExcelFindModule } from './excel-find/excel-find.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from './winston/winston.module';
import { transports, format } from 'winston';
import * as chalk from 'chalk';
import * as dayjs from 'dayjs'
@Module({
  imports: [
    ExcelFindModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.db_host || 'localhost',
      port: 3306,
      username: process.env.db_user || 'root',
      password: process.env.db_pass || 'root' ,
      database: 'test',
      synchronize: true,
      logging: true,
      entities: [ExcelFindModule],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256_password',
      },
    }),
    WinstonModule.forRoot({
      level: 'debug',
      transports: [
          new transports.Console({
              format: format.combine(
                  format.colorize(),
                  format.printf(({context, level, message, time}) => {
                      const appStr = chalk.green(`[NEST]`);
                      const contextStr = chalk.yellow(`[${context}]`);
  
                      return `${appStr} ${time} ${level} ${contextStr} ${message} `;
                  })
              ),
          }),
          new transports.File({
            format: format.combine(
                format.timestamp(),
                format.json()
            ),
            filename: `${dayjs(Date.now()).format('YYYY-MM')}.log`,
            dirname: 'log'
        })
      ]
  }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
