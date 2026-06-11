import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticController } from '../analytic.controller';
import { AnalyticService } from '../analytic.service';
import { after } from 'node:test';

describe('Analytic Controller', () => {
  let analyticService: AnalyticService;
  let analyticController: AnalyticController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticController],
      providers: [AnalyticService],
    }).compile();
    analyticController = module.get<AnalyticController>(AnalyticController);
    analyticService = module.get<AnalyticService>(AnalyticService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(analyticController).toBeDefined();
  });
});
