import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notification.service';
import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { NotificationModuleConstants } from '../../common/constants/messages';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('NotificationController', () => {
  let notificationService: NotificationService;
  let notificationController: NotificationController;
  let jwtService: any;
  let configService: any;
  const mockConfigValues: Record<string, any> = {
    JWT_SECRET: 'fsdfnsfdn',
  };

  const mockEmailPayload = {
    email: 'recipient@example.com',
    name: 'Will Smith',
    password: 'Fsdhdi23SDnsdjadasDA',
  };

  const mockSuccessResponse = {
    status: HttpStatus.OK,
    message: NotificationModuleConstants.SUCCESS_MESSAGES.EMAIL_SUCCESS,
    data: { messageId: 'msg_12345abcde' },
  };

  beforeEach(async () => {
    const mockNotificationService = {
      sendEmail: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('sdfsdfsdf'),
      logger: jest.fn(),
    };
    configService = {
      get: jest.fn().mockResolvedValue(mockConfigValues),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
    notificationController = module.get<NotificationController>(
      NotificationController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should define controller', () => {
    expect(notificationController).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should call sendEmail and send email', async () => {
      jest
        .spyOn(notificationService, 'sendEmail')
        .mockResolvedValue(mockSuccessResponse);
      const result =
        await notificationController.sendNotification(mockEmailPayload);

      expect(notificationService.sendEmail).toHaveBeenCalledTimes(1);
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        mockEmailPayload,
      );

      expect(result).toEqual(mockSuccessResponse);
    });

    it('should throws an internal error', async () => {
      const serviceError = new InternalServerErrorException(
        NotificationModuleConstants.ERROR_MESSAGES.EMAIL_FAILED,
      );
      jest
        .spyOn(notificationService, 'sendEmail')
        .mockRejectedValue(serviceError);

      await expect(
        notificationController.sendNotification(mockEmailPayload),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        notificationController.sendNotification(mockEmailPayload),
      ).rejects.toThrow(
        NotificationModuleConstants.ERROR_MESSAGES.EMAIL_FAILED,
      );
    });
  });
});
