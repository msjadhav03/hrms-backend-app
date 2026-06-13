import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticController } from '../analytic.controller';
import { AnalyticService } from '../analytic.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('Analytic Controller', () => {
  let analyticService: AnalyticService;
  let analyticController: AnalyticController;
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
      controllers: [AnalyticController],
      providers: [
        AnalyticService,
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
