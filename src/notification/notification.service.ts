import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import path from 'path';
import { NotificationModuleConstants } from '../common/constants/messages';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(body): Promise<any> {
    try {
      await this.mailerService.sendMail({
        to: body.email,
        subject: 'Welcome to Our Organization! 🎉',
        template: path.resolve(__dirname, './templates/welcome'),
        context: {
          name: body.name,
          email: body.email,
          password: body.password,
        },
      });
      this.logger.log(`Welcome email successfully sent to ${body.email}`);
      return {
        status: HttpStatus.OK,
        message: NotificationModuleConstants.SUCCESS_MESSAGES.EMAIL_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${body.email}: ${error.message}`,
      );
    }
  }
}
