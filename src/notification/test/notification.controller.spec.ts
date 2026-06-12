import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notification.service';

describe('NotificationController', () => {
  let notificationService: NotificationService;
  let notificationController: NotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
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
});
