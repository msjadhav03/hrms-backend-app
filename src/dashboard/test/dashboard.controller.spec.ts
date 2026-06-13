import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from '../dashboard.controller';
import { DashboardService } from '../dashboard.service';
import { FilterOptionDto } from '../dto/filter.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { DashboardModuleConstants } from '../../common/constants/messages';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: jest.Mocked<DashboardService>;

  const mockDashboardService = {
    getSalaryTrend: jest.fn(),
    departmentWiseTrend: jest.fn(),
    getSalaryTrendRecentYears: jest.fn(),
  };

  const mockAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findSalaryAvgMinMax', () => {
    it('should successfully pass filters to the service and return salary trends', async () => {
      const mockFilter: FilterOptionDto = {
        department: 'Engineering',
        country: 'US',
      };

      const mockResponse = {
        status: HttpStatus.OK,
        message:
          DashboardModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_DASHBOARD_MIN_MAX_AVG,
        data: [{ min: 40000, max: 120000, avg: 80000 }],
      };

      service.getSalaryTrend.mockResolvedValueOnce(mockResponse);
      const result = await controller.findSalaryAvgMinMax(mockFilter);
      expect(service.getSalaryTrend).toHaveBeenCalledWith(mockFilter);
      expect(result).toEqual(mockResponse);
    });

    it('should pass empty or undefined filters smoothly to the service layer', async () => {
      const mockFilter: FilterOptionDto = {};
      const mockResponse = {
        status: HttpStatus.OK,
        message:
          DashboardModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_DASHBOARD_MIN_MAX_AVG,
        data: [{ min: 30000, max: 90000, avg: 60000 }],
      };

      service.getSalaryTrend.mockResolvedValueOnce(mockResponse);
      const result = await controller.findSalaryAvgMinMax(mockFilter);
      expect(service.getSalaryTrend).toHaveBeenCalledWith(mockFilter);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findDepartmentWiseTrend', () => {
    const mockDepartmentResponse = {
      status: 200,
      message:
        DashboardModuleConstants.SUCCESS_MESSAGES.SUCCESS_DASHBOARD_DEPARTMENT,
      data: [
        { department: 'Engineering', count: '15' },
        { department: 'HR', count: '4' },
      ],
    };

    it('should successfully pass query filters and call function', async () => {
      const mockFilter: FilterOptionDto = {
        department: 'HR',
        country: 'CA',
      };
      service.departmentWiseTrend.mockResolvedValueOnce(mockDepartmentResponse);
      const result = await controller.findDepartmentWiseTrend(mockFilter);
      expect(service.departmentWiseTrend).toHaveBeenCalledWith(mockFilter);
      expect(result).toEqual(mockDepartmentResponse);
    });

    it('should handle no filter condition', async () => {
      const mockFilter: FilterOptionDto = {};
      service.departmentWiseTrend.mockResolvedValueOnce(mockDepartmentResponse);
      const result = await controller.findDepartmentWiseTrend(mockFilter);
      expect(service.departmentWiseTrend).toHaveBeenCalledWith(mockFilter);
      expect(result).toEqual(mockDepartmentResponse);
    });
  });

  describe('findLatestYearSalaryTrend', () => {
    const mockResponse = {
      status: 200,
      message:
        DashboardModuleConstants.SUCCESS_MESSAGES
          .SUCCESS_DASHBOARD_RECENT_SALARY,
      data: [
        { year: 2026, min: 2000, max: 40000, avg: 2000 },
        { year: 2027, min: 2000, max: 40000, avg: 2000 },
      ],
    };

    it('should successfully pass query filters and call function', async () => {
      const mockFilter: FilterOptionDto = {
        department: 'HR',
        country: 'CA',
      };
      service.getSalaryTrendRecentYears.mockResolvedValueOnce(mockResponse);
      const result = await controller.findLatestYearSalaryTrend(mockFilter);
      expect(service.getSalaryTrendRecentYears).toHaveBeenCalledWith(
        mockFilter,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle no filter condition', async () => {
      const mockFilter: FilterOptionDto = {};
      service.getSalaryTrendRecentYears.mockResolvedValueOnce(mockResponse);
      const result = await controller.findLatestYearSalaryTrend(mockFilter);
      expect(service.getSalaryTrendRecentYears).toHaveBeenCalledWith(
        mockFilter,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
