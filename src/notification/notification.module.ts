import { Module } from '@nestjs/common';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { DatabaseProviders } from '../database/database.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    JwtModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST'),
          port: config.get<number>('SMTP_PORT'),
          auth: {
            user: config.get<string>('SMTP_USER'),
            pass: config.get<string>('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: '"HRMS: <No Reply>" <noreply@yourcompany.com>',
        },
        template: {
          dir: join(__dirname, '../templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [...DatabaseProviders, NotificationService],
})
export class NotificationModule {}
