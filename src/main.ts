import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const rawOrigins = configService.get<string>('ALLOWDED_ORIGINS');
  const allowedOrigins = rawOrigins
    ? rawOrigins.split(',').map((origin) => origin.trim().replace(/\/$/, ''))
    : [];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed = allowedOrigins.includes(cleanOrigin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS configuration'));
      }
    },
    credentials: true,
  });

  await app.listen(configService.get<number>('PORT') || 3000);
}
bootstrap();
