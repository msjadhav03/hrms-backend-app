import { Test, TestingModule } from '@nestjs/testing';
import { NotificationModule } from '../notification.module';
import { NotificationService } from '../notification.service';
import { NotificationController } from '../notification.controller';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

jest.mock('../../database/database.service', () => ({
  DatabaseProviders: [
    {
      provide: 'PG_CONNECTION',
      useValue: { query: jest.fn() },
    },
  ],
}));

describe('Notifcation Module', () => {
  let moduleInstance: TestingModule;
  const mockConfigValues: Record<string, any> = {
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: 465,
    SMTP_USER: 'test@gmail.com',
    SMTP_PASSWORD: 'mockAppPassword123',
  };

  beforeEach(async () => {
    jest
      .spyOn(ConfigService.prototype, 'get')
      .mockImplementation((key: string) => {
        return mockConfigValues[key];
      });

    moduleInstance = await Test.createTestingModule({
      imports: [NotificationModule],
    }).compile();
  });

  afterEach(async () => {
    if (moduleInstance) {
      await moduleInstance.close();
    }
    jest.clearAllMocks();
  });

  it('should compile the module successfully', () => {
    expect(moduleInstance).toBeDefined();
  });

  it('should load NotificationController', () => {
    const controller = moduleInstance.get<NotificationController>(
      NotificationController,
    );
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(NotificationController);
  });

  it('should inject NotificationService', () => {
    const service =
      moduleInstance.get<NotificationService>(NotificationService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(NotificationService);
  });

  it('should instantiate the MailerService provider', () => {
    const mailerService = moduleInstance.get<MailerService>(MailerService);
    expect(mailerService).toBeDefined();
  });
});
