import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { DashboardController } from '../dashboard.controller';
describe('Dashboard Controller', () => {
  let dashboardService: DashboardService;
  let dashboardController: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [DashboardService],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
    dashboardController = module.get<DashboardController>(DashboardController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(dashboardController).toBeDefined();
  });
});
