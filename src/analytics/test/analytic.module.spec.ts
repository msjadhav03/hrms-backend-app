import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticController } from '../analytic.controller';
import { AnalyticService } from '../analytic.service';
import { DatabaseProviders } from '../../database/database.service';
import { AnalyticModule } from '../analytic.module';
import { mock } from 'node:test';

describe('Analytic Module', () => {
  let module: TestingModule;
  let mockPool: any;

  beforeEach(async () => {
    mockPool = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
    };
    module = await Test.createTestingModule({
      imports: [AnalyticModule],
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
