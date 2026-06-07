import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    //  Specify allowed origins - For now updating local string
    origin: configService.get<string>('ALLOWED_ORIGINS'),
  });

  await app.listen(configService.get<number>('PORT') || 3000);
}
bootstrap();
