import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from '../dashboard.controller';
import { DashboardService } from '../dashboard.service';
import { DashboardModule } from '../dashboard.module';
import { DashboardModuleConstants } from '../../common/constants/messages';

describe('Dashboard Module', () => {
  let moduleInstance: TestingModule;
  let mockPool: any;

  beforeEach(async () => {
    mockPool = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
    };
    moduleInstance = await Test.createTestingModule({
      imports: [DashboardModule],
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
