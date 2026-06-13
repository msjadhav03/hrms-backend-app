import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { DashboardController } from '../dashboard.controller';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
describe('Dashboard Controller', () => {
  let dashboardService: DashboardService;
  let dashboardController: DashboardController;
  let jwtService: any;
  let configService: any;
  const mockConfigValues: Record<string, any> = {
    JWT_SECRET: 'fsdfnsfdn',
  };

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('sdfsdfsdf'),
      logger: jest.fn(),
    };
    configService = {
      get: jest.fn().mockResolvedValue(mockConfigValues),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        DashboardService,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
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
