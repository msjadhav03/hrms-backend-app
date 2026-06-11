import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticService } from '../analytic.service';

describe('Analytic Service', () => {
  let analyticService: AnalyticService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticService],
    }).compile();

    analyticService = module.get<AnalyticService>(AnalyticService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(analyticService).toBeDefined();
  });
});
