import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';

describe('Dashboard Service', () => {
  let dashboardService: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(dashboardService).toBeDefined();
  });
});
