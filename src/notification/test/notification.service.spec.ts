import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
import path from 'path';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockMailerService: Partial<MailerService>;
  const mockBodyPayload = {
    email: 'will@company.com',
    name: 'Will Smith',
    password: 'TemporarySecurePassword123!',
  };

  beforeEach(async () => {
    mockMailerService = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'smtp_mock_id_999' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be service defined', () => {
    expect(notificationService).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should call sendMail', async () => {
      await notificationService.sendEmail(mockBodyPayload);

      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: mockBodyPayload.email,
        subject: 'Welcome to Our Organization! 🎉',
        template: path.resolve(__dirname, '../templates/welcome'),
        context: {
          name: mockBodyPayload.name,
          email: mockBodyPayload.email,
          password: mockBodyPayload.password,
        },
      });
    });

    it('should write a success message ', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await notificationService.sendEmail(mockBodyPayload);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Welcome email successfully sent to ${mockBodyPayload.email}`,
        ),
      );
    });

    it('should gracefully catch SMTP execution flags and log an error without crashing', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const smtpErrorMessage = 'Connection timed out on port 465';

      (mockMailerService.sendMail as jest.Mock).mockRejectedValue(
        new Error(smtpErrorMessage),
      );

      await expect(
        notificationService.sendEmail(mockBodyPayload),
      ).resolves.not.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Failed to send welcome email to ${mockBodyPayload.email}: ${smtpErrorMessage}`,
        ),
      );
    });
  });
});
