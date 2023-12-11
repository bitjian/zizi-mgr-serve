import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import {WINSTON_LOGGER_TOKEN} from './winston/winston.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('/api')
  app.useLogger(app.get(WINSTON_LOGGER_TOKEN));
  app.enableCors({
    origin: 'http://9.135.224.61:3002',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
