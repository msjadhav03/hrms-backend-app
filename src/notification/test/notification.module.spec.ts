import { Test, TestingModule } from '@nestjs/testing';
import { NotificationModule } from '../notification.module';
import { NotificationService } from '../notification.service';
import { NotificationController } from '../notification.controller';
import { DatabaseProviders } from 'src/database/database.service';

describe('Notifcation Module', () => {
  let moduleInstance: TestingModule;
  let mockPool: any;

  beforeEach(async () => {
    mockPool = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
    };
    moduleInstance = await Test.createTestingModule({
      imports: [NotificationModule],
    })
      .overrideProvider('PG_CONNECTION')
      .useValue(mockPool)
      .compile();
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
});
