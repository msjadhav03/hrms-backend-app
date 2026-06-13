import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticController } from '../analytic.controller';
import { AnalyticService } from '../analytic.service';
import { GetAnalyticDto } from '../dto/get.analytic.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { HttpStatus } from '@nestjs/common';
import { AnalyticModuleConstants } from '../../common/constants/messages';

describe('Analytic Controller', () => {
  let analyticService: jest.Mocked<AnalyticService>;
  let analyticController: AnalyticController;

  const mockAnalyticService = {
    findCountOfEntities: jest.fn(),
    findTopMostPaidJobs: jest.fn(),
    findTopMostPaidDepartment: jest.fn(),
  };

  const mockAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticController],
      providers: [
        {
          provide: AnalyticService,
          useValue: mockAnalyticService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    analyticController = module.get<AnalyticController>(AnalyticController);
    analyticService = module.get(AnalyticService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(analyticController).toBeDefined();
  });

  describe('findEntityCount', () => {
    it('should pass filter and call service function and return success response', async () => {
      const mockFilter: GetAnalyticDto = { country: 'India' };
      const mockResponse = {
        status: HttpStatus.OK,
        message: AnalyticModuleConstants.SUCCESS_MESSAGES.SUCCESS_ENTITY_COUNT,
        data: [
          {
            employeeCount: 10,
            departmentCount: 2,
            jobTitleCount: 4,
            countryCount: 1,
          },
        ],
      };
      analyticService.findCountOfEntities.mockResolvedValueOnce(mockResponse);
      const result = await analyticController.findEntityCount(mockFilter);
      expect(analyticService.findCountOfEntities).toHaveBeenCalledWith(
        mockFilter,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findTopMostPaidJobs', () => {
    it('Should pass filter and return data as per filter', async () => {
      const mockFilter: GetAnalyticDto = { country: 'India' };
      const mockResponse = {
        status: HttpStatus.OK,
        message:
          AnalyticModuleConstants.SUCCESS_MESSAGES.SUCCESS_TOP_MOST_PAID_JOBS,
        data: [{ job_title: 'Director', salary: 220000 }],
      };
      analyticService.findTopMostPaidJobs.mockResolvedValueOnce(mockResponse);
      const result = await analyticController.findTopMostPaidJobs(mockFilter);
      expect(analyticService.findTopMostPaidJobs).toHaveBeenCalledWith(
        mockFilter,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findTopMostPaidDepartment', () => {
    it('should pass parameter and return data as per filter parameter', async () => {
      const mockFilter: GetAnalyticDto = {};
      const mockResponse = {
        status: HttpStatus.OK,
        message:
          AnalyticModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_TOP_MOST_PAID_DEPARTMENT,
        data: [{ department: 'Sales', total_salary: 850000 }],
      };
      analyticService.findTopMostPaidDepartment.mockResolvedValueOnce(
        mockResponse,
      );
      const result =
        await analyticController.findTopMostPaidDepartment(mockFilter);
      expect(analyticService.findTopMostPaidDepartment).toHaveBeenCalledWith(
        mockFilter,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
