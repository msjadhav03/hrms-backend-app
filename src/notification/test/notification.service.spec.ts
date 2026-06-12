import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification.service';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be service defined', () => {
    expect(notificationService).toBeDefined();
  });
});
