import { Module } from '@nestjs/common';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { DatabaseProviders } from 'src/database/database.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: configService.get<string>('SMTP_HOST'),
        port: configService.get<number>('SMTP_PORT'),
        auth: {
          user: configService.get<string>('SMTP_USER'),
          pass: configService.get<string>('SMTP_PASSWORD'),
        },
      },
      defaults: {
        from: '"No Reply" <noreply@yourcompany.com>',
      },
      template: {
        dir: join(__dirname, '../templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [NotificationController],
  providers: [...DatabaseProviders, NotificationService],
})
export class NotificationModule {}
