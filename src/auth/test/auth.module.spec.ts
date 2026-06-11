import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth.module';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { DatabaseProviders } from '../../database/database.service';

describe('Auth Module', () => {
  let module: TestingModule;
  let mockPool: any;
  beforeEach(async () => {
    mockPool = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
    };
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider('PG_CONNECTION')
      .useValue(mockPool)
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
    jest.clearAllMocks();
  });

  it('should compile the module successfully', () => {
    expect(module).toBeDefined();
  });
});
