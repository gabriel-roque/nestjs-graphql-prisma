import { CorsConfig, NestConfig } from './configs/config.interface';
import { ConfigService } from '@nestjs/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const corsConfig = configService.get<CorsConfig>('cors');

  // TODO: Config me when have domains whitelist
  if (corsConfig.enabled) app.enableCors({ origin: '*' });
  await app.listen(nestConfig.port);
}

bootstrap();
