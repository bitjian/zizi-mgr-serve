import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import {WINSTON_LOGGER_TOKEN} from './winston/winston.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: 'https://www.bitjian.cn',
    methods: 'GET,HEAD,POST,OPTION',
    allowedHeaders: '*',
    credentials: false,
  });
  app.setGlobalPrefix('/api')
  app.useLogger(app.get(WINSTON_LOGGER_TOKEN));
  await app.listen(3000);
}
bootstrap();
