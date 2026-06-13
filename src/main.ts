import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  });
  const config = new DocumentBuilder()
    .setTitle('HRMS API')
    .setDescription('Detailed API documentation HRMS application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your valid JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
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
